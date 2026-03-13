const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, experienceController.getExperiences);
router.get('/:id', protect, experienceController.getExperience);
router.post('/', protect, experienceController.createExperience);
router.put('/:id', protect, experienceController.updateExperience);
router.delete('/:id', protect, experienceController.deleteExperience);

module.exports = router;
