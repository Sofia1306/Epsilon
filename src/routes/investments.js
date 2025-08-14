const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const authMiddleware = require('../middleware/auth');

// Cash management routes (must come before parameterized routes)
router.get('/cash/balance', authMiddleware.verifyToken, investmentController.getCashBalance);
router.post('/cash/add', authMiddleware.verifyToken, investmentController.addCash);

// Transaction history
router.get('/transactions/history', authMiddleware.verifyToken, investmentController.getTransactionHistory);

// Get all investments
router.get('/', authMiddleware.verifyToken, investmentController.getAllInvestments);

// Get investment by ID
router.get('/:id', authMiddleware.verifyToken, investmentController.getInvestmentById);

// Create new investment (buy)
router.post('/', authMiddleware.verifyToken, investmentController.createInvestment);

// Sell investment
router.post('/:id/sell', authMiddleware.verifyToken, investmentController.sellInvestment);

// Delete investment
router.delete('/:id', authMiddleware.verifyToken, investmentController.deleteInvestment);

module.exports = router;