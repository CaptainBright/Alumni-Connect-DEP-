const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profiles', protect, adminOnly, adminController.getProfiles);
router.post('/approve', protect, adminOnly, adminController.approveProfile);
router.post('/reject', protect, adminOnly, adminController.rejectProfile);
router.get('/export-users', protect, adminOnly, adminController.exportUsersExcel);

module.exports = router;
