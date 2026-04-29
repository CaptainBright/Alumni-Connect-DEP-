const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const connectionController = require('../controllers/connectionController');

// All routes require authentication
router.get('/', protect, connectionController.getUserConnections);
router.post('/request', protect, connectionController.sendRequest);
router.put('/:id/status', protect, connectionController.updateStatus);
router.delete('/:id', protect, connectionController.deleteConnection);

module.exports = router;
