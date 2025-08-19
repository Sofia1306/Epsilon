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

// Serve static files - SOLO desde /public/
app.use(express.static(path.join(__dirname, '../public')));

// URLs disponibles:
// http://localhost:3000/                    → index.html
// http://localhost:3000/register.html      → register.html  
// http://localhost:3000/login.html         → login.html
// http://localhost:3000/dashboard.html     → dashboard.html
// http://localhost:3000/buy-stocks.html    → buy-stocks.html
// http://localhost:3000/manage-investments.html → manage-investments.html
// http://localhost:3000/market.html        → market.html

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

// Web Routes - páginas HTML servidas desde /public/
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Rutas específicas para páginas principales (opcional, para mejor SEO)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/buy-stocks', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/buy-stocks.html'));
});

app.get('/manage-investments', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/manage-investments.html'));
});

app.get('/market', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/market.html'));
});

// Catch-all for API routes not found
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Catch-all para rutas web no encontradas - redirigir a página principal
app.get('*', (req, res) => {
    res.redirect('/register.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Web pages: http://localhost:${PORT}/`);
    console.log(`API routes: http://localhost:${PORT}/api/`);
});