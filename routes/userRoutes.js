const express = require("express");
const router = express.Router();
const { signupUser, loginUser, forgotPassword, getAllUsers, updateUser, sendOtpController, verifyOtpController } = require("../controllers/userController");
const { authenticate } = require("../controllers/userController");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/reset-pass", forgotPassword);
router.get("/get-all-users", authenticate, getAllUsers);
router.put("/edit-users/:id", authenticate, updateUser);
router.post("/email-otp", sendOtpController);
router.post("/verify-email-otp", verifyOtpController);

module.exports = router;
