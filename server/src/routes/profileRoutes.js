const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// POST /api/profile/upload-avatar — file upload via multer
router.post('/upload-avatar', protect, upload.single('avatar'), profileController.uploadAvatar);

// POST /api/profile/update-avatar — legacy (kept for backward compat)
router.post('/update-avatar', protect, upload.single('avatar'), profileController.uploadAvatar);

// DELETE /api/profile/delete-avatar
router.delete('/delete-avatar', protect, profileController.deleteAvatar);

// PUT /api/profile/update
router.put('/update', protect, profileController.updateProfile);

module.exports = router;
