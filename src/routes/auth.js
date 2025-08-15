const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.post('/refresh', authMiddleware.verifyToken, authController.refreshToken);
router.post('/logout', authMiddleware.verifyToken, authController.logout);

// Test route to verify JWT implementation
router.get('/verify', authMiddleware.verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

module.exports = router;