const { Investment } = require('../models');
const financeAPI = require('../services/financeAPI');

// Get net investment for the user's portfolio
const getNetInvestment = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const investments = await Investment.findAll({
            where: { userId }
        });
        
        const netInvestment = investments.reduce((total, investment) => {
            return total + parseFloat(investment.totalInvested);
        }, 0);
        
        res.json({
            success: true,
            data: {
                netInvestment: netInvestment.toFixed(2),
                totalInvestments: investments.length
            }
        });
    } catch (error) {
        console.error('Error getting net investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving net investment'
        });
    }
};

// Get cash flow for the user's portfolio
const getCashFlow = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const investments = await Investment.findAll({
            where: { userId }
        });
        
        let totalInvested = 0;
        let currentValue = 0;
        
        for (const investment of investments) {
            totalInvested += parseFloat(investment.totalInvested);
            
            try {
                const stockData = await financeAPI.getStockPrice(investment.symbol);
                currentValue += stockData.price * investment.quantity;
            } catch (error) {
                currentValue += parseFloat(investment.currentPrice || investment.purchasePrice) * investment.quantity;
            }
        }
        
        const netCashFlow = currentValue - totalInvested;
        
        const cashFlow = {
            inflow: currentValue.toFixed(2),
            outflow: totalInvested.toFixed(2),
            netCashFlow: netCashFlow.toFixed(2)
        };
        
        res.json({
            success: true,
            data: cashFlow
        });
    } catch (error) {
        console.error('Error getting cash flow:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cash flow'
        });
    }
};

// Get portfolio details for the user
const getPortfolioDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const investments = await Investment.findAll({
            where: { userId }
        });
        
        let totalInvested = 0;
        let currentValue = 0;
        
        for (const investment of investments) {
            totalInvested += parseFloat(investment.totalInvested);
            
            try {
                const stockData = await financeAPI.getStockPrice(investment.symbol);
                currentValue += stockData.price * investment.quantity;
                
                // Update current price in database
                investment.currentPrice = stockData.price;
                await investment.save();
            } catch (error) {
                currentValue += parseFloat(investment.currentPrice || investment.purchasePrice) * investment.quantity;
            }
        }
        
        const totalReturn = currentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
        
        const portfolioDetails = {
            totalValue: currentValue.toFixed(2),
            totalInvestments: investments.length,
            totalInvested: totalInvested.toFixed(2),
            totalReturn: totalReturn.toFixed(2),
            returnPercentage: returnPercentage.toFixed(2)
        };
        
        res.json({
            success: true,
            data: portfolioDetails
        });
    } catch (error) {
        console.error('Error getting portfolio details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving portfolio details'
        });
    }
};

module.exports = {
    getNetInvestment,
    getCashFlow,
    getPortfolioDetails
};