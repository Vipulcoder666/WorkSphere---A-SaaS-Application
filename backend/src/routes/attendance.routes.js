const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const attendanceController = require('../controllers/attendance.controller');

const router = express.Router();

// Require authentication for all attendance routes
router.use(authenticate);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getHistory);

module.exports = router;