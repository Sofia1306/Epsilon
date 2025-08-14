const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// Get market moves
router.get('/market-moves', marketController.getMarketMoves);

// Get market data/overview
router.get('/market-data', marketController.getMarketData);

// Get stock price by symbol
router.get('/stock-price/:symbol', marketController.getStockPrice);

// Search stocks
router.get('/search-stocks', marketController.searchStocks);

// Get historical data for a stock
router.get('/historical-data/:symbol', marketController.getHistoricalData);

module.exports = router;