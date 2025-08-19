const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
    try {
        let token = null;
        let userId = null;

        // Method 1: Check Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }

        // Method 2: Check x-user-id header (fallback for existing implementation)
        if (!token && req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
        }

        // If we have a JWT token, verify it
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
                
                // Add token info to request
                req.tokenData = decoded;
            } catch (jwtError) {
                console.error('JWT verification failed:', jwtError.message);
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }
        }

        // Verify user exists
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido'
            });
        }

        // Find user in database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Add user to request object
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};

// Optional auth middleware (doesn't require authentication)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const userId = req.headers['x-user-id'];

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findByPk(decoded.userId);
                if (user) {
                    req.user = user;
                    req.userId = user.id;
                }
            } catch (jwtError) {
                // Token invalid, but continue without auth
                console.log('Optional auth: Invalid token, continuing without auth');
            }
        } else if (userId) {
            try {
                const user = await User.findByPk(userId);
                if (user) {
                    req.user = user;
                    req.userId = user.id;
                }
            } catch (error) {
                // User not found, continue without auth
                console.log('Optional auth: User not found, continuing without auth');
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even if there's an error
    }
};

// Admin middleware (for admin-only routes)
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        // Check if user is admin (you can add an isAdmin field to User model)
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acceso de administrador requerido'
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error de autorización'
        });
    }
};

module.exports = {
    verifyToken,
    optionalAuth,
    requireAdmin
};