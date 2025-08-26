const express = require("express");
const router = express.Router();
const { signupUser, loginUser, forgotPassword, getAllUsers } = require("../controllers/userController");
const { authenticate } = require("../controllers/userController");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/reset-pass", forgotPassword);
router.get("/get-all-users", authenticate, getAllUsers);

module.exports = router;
