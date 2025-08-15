const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : req.header('x-auth-token') || req.header('x-user-id'); // Fallback for existing implementation
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const user = await User.findByPk(decoded.userId, {
                attributes: { exclude: ['password'] }
            });
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is valid but user not found'
                });
            }
            
            // Add user to request object
            req.user = user;
            next();
            
        } catch (jwtError) {
            // If JWT fails, try the old simple auth as fallback
            if (token && !isNaN(token)) {
                const user = await User.findByPk(parseInt(token), {
                    attributes: { exclude: ['password'] }
                });
                
                if (user) {
                    req.user = user;
                    return next();
                }
            }
            
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            });
        }
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

// Optional authentication (for public routes with optional user data)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : req.header('x-auth-token');
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findByPk(decoded.userId, {
                    attributes: { exclude: ['password'] }
                });
                
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token invalid, but continue without user
                req.user = null;
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        req.user = null;
        next();
    }
};

// Check if user is admin (for future admin routes)
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        // Add admin field to User model if needed
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin verification'
        });
    }
};

// Rate limiting middleware (basic implementation)
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requests.has(clientId)) {
            requests.set(clientId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const clientData = requests.get(clientId);
        
        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
            return next();
        }
        
        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }
        
        clientData.count++;
        next();
    };
};

const authenticateJWT = verifyToken; // Alias for compatibility

module.exports = {
    verifyToken,
    authenticateJWT,
    optionalAuth,
    requireAdmin,
    rateLimiter
};