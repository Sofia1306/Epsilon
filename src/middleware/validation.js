module.exports = {
    validateRegistration: (req, res, next) => {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Additional validation logic can be added here
        next();
    },

    validateLogin: (req, res, next) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }
        // Additional validation logic can be added here
        next();
    }
};