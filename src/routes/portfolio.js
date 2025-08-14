const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/auth');

// Route to get net investment
router.get('/net-investment', authMiddleware.verifyToken, portfolioController.getNetInvestment);

// Route to get cash flow
router.get('/cash-flow', authMiddleware.verifyToken, portfolioController.getCashFlow);

// Route to get portfolio details
router.get('/', authMiddleware.verifyToken, portfolioController.getPortfolioDetails);

module.exports = router;