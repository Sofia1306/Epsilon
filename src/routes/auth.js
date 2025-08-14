const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (using simple auth)
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;