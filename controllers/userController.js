const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const mongoose = require("mongoose");
const { sendEmail } = require("../service/email");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const normalize = (s = "") => String(s).replace(/\s+/g, "").toLowerCase();

async function isAdminOrSuperAdmin(userId) {
  const user = await User.findById(userId).select("role");
  if (!user || !user.role) return false;

  const role = await Role.findById(user.role).select("roleName");
  if (!role) return false;

  const roleName = normalize(role.roleName);
  return roleName === "admin" || roleName === "superadmin";
}

exports.signupUser = async (req, res) => { 
  try {
    const {
      phone,
      email,
      password,
      role, 
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }] });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    let selectedRole;

    if (role) {
      selectedRole = await Role.findById(role);
      if (!selectedRole) {
        return res.status(400).json({ message: "Invalid role selected." });
      }
      const normalizedRole = selectedRole.roleName.replace(/\s+/g, "").toLowerCase();
      if (normalizedRole !== "user") {
        return res.status(400).json({ message: "You can only register with role 'user'." });
      }
    } else {
      selectedRole = await Role.findOne({
        roleName: { $regex: /^user$/i }
      });
      if (!selectedRole) {
        return res.status(400).json({ message: "Default role 'user' not found in database." });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      phone,
      email,
      password: hashedPassword,
      role: selectedRole._id, 
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "5h"
    });
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 5 * 60 * 60 * 1000 
    });
    await sendEmail({
      to: newUser.email,
      subject: "Welcome to Our Platform!",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4CAF50;">🎉 Welcome to Our Platform!</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${newUser.email}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            You have successfully signed up with us. We're thrilled to have you on board!
          </p>
          <p style="font-size: 16px; color: #333;">
            Your account is now active and ready to use.
          </p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #888;">
            If you did not sign up for this account, please ignore this email or contact support.
          </p>
          <p style="font-size: 16px; color: #4CAF50;">
            – The Team
          </p>
        </div>
      `
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: selectedRole.roleName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      const isMatch = await bcrypt.compare(password, user.password);
        
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'Lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
      
      res.status(200).json({
        message: "Login successful",
        // token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: {
            id: user.role._id,
            name: user.role.roleName
          },
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.forgotPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User with this email does not exist." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();
      await sendEmail({
        to: email,
        subject: "🔒 Your Password Has Been Reset",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f44336;">🔐 Password Reset Confirmation</h2>
            <p style="font-size: 16px; color: #333;">
              Hello <strong>${email}</strong>,
            </p>
            <p style="font-size: 16px; color: #333;">
              Your password has been successfully reset.
            </p>
            <p style="font-size: 16px; color: #333;">
              If you did not perform this action, please change your password immediately or contact our support team.
            </p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 14px; color: #888;">
              Thank you for using our platform.
            </p>
            <p style="font-size: 16px; color: #f44336;">
              – The Team
            </p>
          </div>
        `
      });
      res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


exports.authenticate = async (req, res, next) => {
  // console.log('Cookies:', req.cookies);
  // const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ message: "Authorization token missing or invalid." });
  // }

  // const token = authHeader.split(" ")[1];
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can view users." });
    }
    const users = await User.find()
      .select("-password") 
      .populate("role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};