const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/profile/update-avatar
router.post('/update-avatar', protect, profileController.updateAvatar);

module.exports = router;
