const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/auth');

// Get portfolio details
router.get('/', authMiddleware.verifyToken, portfolioController.getPortfolioDetails);

// Get net investment over time
router.get('/net-investment', authMiddleware.verifyToken, portfolioController.getNetInvestment);

// Get cash flow analysis
router.get('/cash-flow', authMiddleware.verifyToken, portfolioController.getCashFlow);

module.exports = router;