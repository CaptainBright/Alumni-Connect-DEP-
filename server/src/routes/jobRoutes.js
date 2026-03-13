const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, jobController.getJobs);
router.post('/', protect, jobController.createJob);

module.exports = router;
