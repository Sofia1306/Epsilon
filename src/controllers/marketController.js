const financeAPI = require('../services/financeAPI');

// Get market data/overview
const getMarketData = async (req, res) => {
    try {
        const marketData = await financeAPI.getMarketData();
        
        res.json({
            success: true,
            data: marketData
        });
    } catch (error) {
        console.error('Error getting market data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving market data'
        });
    }
};

// Get stock price by symbol
const getStockPrice = async (req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await financeAPI.getStockPrice(symbol);
        
        res.json({
            success: true,
            data: stockData
        });
    } catch (error) {
        console.error('Error getting stock price:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving stock price'
        });
    }
};

// Search stocks
const searchStocks = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchResults = await financeAPI.searchStocks(query);
        
        res.json({
            success: true,
            data: searchResults
        });
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching stocks'
        });
    }
};

// Get historical data for a stock
const getHistoricalData = async (req, res) => {
    try {
        const { symbol } = req.params;
        const { period } = req.query;
        
        // TODO: Implement historical data retrieval logic
        const historicalData = [];
        
        res.json({
            success: true,
            data: historicalData
        });
    } catch (error) {
        console.error('Error getting historical data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving historical data'
        });
    }
};

// Get market moves
const getMarketMoves = async (req, res) => {
    try {
        // TODO: Implement market moves logic
        const marketMoves = {
            gainers: [],
            losers: [],
            active: []
        };
        
        res.json({
            success: true,
            data: marketMoves
        });
    } catch (error) {
        console.error('Error getting market moves:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving market moves'
        });
    }
};

module.exports = {
    getMarketData,
    getStockPrice,
    searchStocks,
    getHistoricalData,
    getMarketMoves
};