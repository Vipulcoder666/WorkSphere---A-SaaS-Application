const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// Require authentication and ADMIN/HR role for company dashboard stats
router.use(authenticate);
router.get('/stats', authorize('ADMIN', 'HR'), dashboardController.getStats);

module.exports = router;