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
        await sequelize.sync({ force: false });
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
});

// API Routes - todas las rutas de API tienen el prefijo /api/
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/market', marketRoutes);

// Web Routes - páginas HTML sin prefijo
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Catch-all for API routes not found
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Web pages: http://localhost:${PORT}/`);
    console.log(`API routes: http://localhost:${PORT}/api/`);
});