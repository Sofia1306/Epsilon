const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password reset routes (public)
router.post('/forgot-password', authController.requestPasswordReset);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.post('/refresh', authMiddleware.verifyToken, authController.refreshToken);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.get('/verify', authMiddleware.verifyToken, authController.verify);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;