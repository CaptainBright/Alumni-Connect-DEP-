const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Session routes
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.get('/me', protect, authController.getMe);

// Existing OTP routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

router.post('/send-register-otp', authController.sendRegisterOtp);
router.post('/verify-register-otp', authController.verifyRegisterOtp);

module.exports = router;
