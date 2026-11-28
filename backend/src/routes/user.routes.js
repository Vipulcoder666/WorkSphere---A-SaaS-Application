const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Require authentication for all user routes
router.use(authenticate);

// Only ADMIN can create new users in the company
router.post('/', authorize('ADMIN'), userController.createUser);

// ADMIN and HR can view all users in their company
router.get('/', authorize('ADMIN', 'HR'), userController.getUsers);

module.exports = router;