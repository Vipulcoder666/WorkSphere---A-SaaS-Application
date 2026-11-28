const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const leaveController = require('../controllers/leave.controller');

const router = express.Router();

// Require authentication for all leave routes
router.use(authenticate);

router.post('/', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.patch('/:id/status', authorize('ADMIN', 'HR'), leaveController.updateLeaveStatus);

module.exports = router;