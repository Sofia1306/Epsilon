const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const investmentRoutes = require('./routes/investments');
const marketRoutes = require('./routes/market');
const { connectToDatabase, sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Database connection and sync
connectToDatabase().then(async () => {
    try {
        await sequelize.sync({ force: false }); // Cambiar a false para mantener los datos
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/market', marketRoutes);

// Root route redirect
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});