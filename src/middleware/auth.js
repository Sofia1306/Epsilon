// Simple session-based authentication without JWT

const verifyToken = (req, res, next) => {
    try {
        // For simplicity, we'll use a user ID from headers or session
        const userId = req.header('x-user-id');
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No user ID provided, authorization denied'
            });
        }

        // Set user data for controllers
        req.user = { id: parseInt(userId) };
        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

const authenticateJWT = verifyToken; // Alias for compatibility

module.exports = {
    authenticateJWT,
    verifyToken
};