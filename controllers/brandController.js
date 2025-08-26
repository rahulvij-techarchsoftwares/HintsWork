const Brand = require("../models/brandsModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");

const normalize = (s = "") => String(s).replace(/\s+/g, "").toLowerCase();

async function isAdminOrSuperAdmin(userId) {
  const user = await User.findById(userId).select("role");
  if (!user || !user.role) return false;

  const role = await Role.findById(user.role).select("roleName");
  if (!role) return false;

  const roleName = normalize(role.roleName);
  return roleName === "admin" || roleName === "superadmin";
}

exports.addBrand = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can add brands." });
    }
    const { name, description = "", status = true } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Brand name is required." });
    }
    const existing = await Brand.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "Brand name already exists." });
    }
    const brand = await Brand.create({
      name: name.trim(),
      description: description.trim(),
      status: Boolean(status),
    });
    return res.status(201).json({ message: "Brand added successfully.", brand });
  } catch (error) {
    console.error("addBrand error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editBrand = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can edit brands." });
    }
    const { id } = req.params;
    const { name, description, status } = req.body;
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }
    if (name) brand.name = name.trim();
    if (description) brand.description = description.trim();
    if (status !== undefined) brand.status = Boolean(status);
    await brand.save();
    return res.status(200).json({ message: "Brand updated successfully.", brand });
  } catch (error) {
    console.error("editBrand error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can delete brands." });
    }
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }
    return res.status(200).json({ message: "Brand deleted successfully." });
  } catch (error) {
    console.error("deleteBrand error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can view brands." });
    }
    const brands = await Brand.find().sort({ createdAt: -1 });
    return res.status(200).json({ brands });
  } catch (error) {
    console.error("getAllBrands error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

