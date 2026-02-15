const express = require("express");
const router = express.Router();
const { loginUser, sendOtp, verifyOtp, resetPassword, sendRegisterOtp, verifyRegisterOtp } = require("../controllers/authController");

router.post("/login", (req, res) => res.status(501).json({ message: "Use Supabase client for login" })); // Placeholder or keep generic
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/send-register-otp", sendRegisterOtp);
router.post("/verify-register-otp", verifyRegisterOtp);

module.exports = router;
