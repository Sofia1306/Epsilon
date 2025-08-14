const { Investment, User, Transaction } = require('../models');
const financeAPI = require('../services/financeAPI');
const { sequelize } = require('../config/database');

// Get all investments for the user
const getAllInvestments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Update current prices for all investments
        const updatedInvestments = await Promise.all(
            investments.map(async (investment) => {
                try {
                    const stockData = await financeAPI.getStockPrice(investment.symbol);
                    investment.currentPrice = stockData.price;
                    await investment.save();
                    
                    return {
                        ...investment.toJSON(),
                        currentValue: (stockData.price * investment.quantity).toFixed(2),
                        gainLoss: ((stockData.price * investment.quantity) - investment.totalInvested).toFixed(2),
                        gainLossPercent: (((stockData.price - investment.purchasePrice) / investment.purchasePrice) * 100).toFixed(2)
                    };
                } catch (error) {
                    return investment.toJSON();
                }
            })
        );
        
        res.json({
            success: true,
            data: updatedInvestments
        });
    } catch (error) {
        console.error('Error getting investments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving investments'
        });
    }
};

// Get single investment by ID
const getInvestmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const investment = await Investment.findOne({
            where: { id, userId }
        });
        
        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        // Update current price
        try {
            const stockData = await financeAPI.getStockPrice(investment.symbol);
            investment.currentPrice = stockData.price;
            await investment.save();
        } catch (error) {
            console.log('Could not update current price');
        }
        
        res.json({
            success: true,
            data: investment
        });
    } catch (error) {
        console.error('Error getting investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving investment'
        });
    }
};

// Create new investment (buy stocks)
const createInvestment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const userId = req.user.id;
        const { symbol, quantity } = req.body;

        if (!symbol || !quantity || quantity <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Symbol and valid quantity are required'
            });
        }

        // Get current stock price
        const stockData = await financeAPI.getStockPrice(symbol.toUpperCase());
        const totalCost = (stockData.price * quantity);

        // Get user's cash balance
        const user = await User.findByPk(userId);
        if (user.cashBalance < totalCost) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Insufficient funds. You have $${user.cashBalance.toFixed(2)} but need $${totalCost.toFixed(2)}`
            });
        }

        // Check if user already has this stock
        const existingInvestment = await Investment.findOne({
            where: { userId, symbol: symbol.toUpperCase() },
            transaction
        });

        if (existingInvestment) {
            // Update existing investment
            const newTotalQuantity = existingInvestment.quantity + parseInt(quantity);
            const newTotalInvested = parseFloat(existingInvestment.totalInvested) + totalCost;
            const newAveragePrice = newTotalInvested / newTotalQuantity;

            await existingInvestment.update({
                quantity: newTotalQuantity,
                totalInvested: newTotalInvested.toFixed(2),
                purchasePrice: newAveragePrice.toFixed(2),
                currentPrice: stockData.price
            }, { transaction });
        } else {
            // Create new investment
            await Investment.create({
                userId,
                symbol: symbol.toUpperCase(),
                companyName: stockData.shortName,
                quantity: parseInt(quantity),
                purchasePrice: stockData.price,
                currentPrice: stockData.price,
                totalInvested: totalCost.toFixed(2)
            }, { transaction });
        }

        // Deduct cash from user's balance
        await user.update({
            cashBalance: (parseFloat(user.cashBalance) - totalCost).toFixed(2)
        }, { transaction });

        // Record transaction
        await Transaction.create({
            userId,
            symbol: symbol.toUpperCase(),
            transactionType: 'BUY',
            quantity: parseInt(quantity),
            price: stockData.price,
            totalAmount: totalCost.toFixed(2)
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: `Successfully bought ${quantity} shares of ${symbol.toUpperCase()} for $${totalCost.toFixed(2)}`,
            data: {
                remainingCash: (parseFloat(user.cashBalance) - totalCost).toFixed(2)
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error purchasing stock'
        });
    }
};

// Sell stocks
const sellInvestment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { quantity } = req.body;

        const investment = await Investment.findOne({
            where: { id, userId },
            transaction
        });

        if (!investment) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        if (quantity > investment.quantity) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot sell more shares than you own'
            });
        }

        // Get current stock price
        const stockData = await financeAPI.getStockPrice(investment.symbol);
        const saleAmount = stockData.price * quantity;
        
        // Get user to update cash balance
        const user = await User.findByPk(userId, { transaction });

        if (quantity === investment.quantity) {
            // Sell all shares - delete investment
            await investment.destroy({ transaction });
        } else {
            // Partial sell - update investment
            const sellRatio = quantity / investment.quantity;
            const newQuantity = investment.quantity - quantity;
            const newTotalInvested = (investment.totalInvested * (1 - sellRatio)).toFixed(2);
            
            await investment.update({
                quantity: newQuantity,
                totalInvested: newTotalInvested,
                currentPrice: stockData.price
            }, { transaction });
        }

        // Add cash to user's balance
        const newCashBalance = (parseFloat(user.cashBalance) + saleAmount).toFixed(2);
        await user.update({
            cashBalance: newCashBalance
        }, { transaction });

        // Record transaction
        await Transaction.create({
            userId,
            symbol: investment.symbol,
            transactionType: 'SELL',
            quantity: quantity,
            price: stockData.price,
            totalAmount: saleAmount.toFixed(2)
        }, { transaction });

        await transaction.commit();

        // Calculate profit/loss
        const avgPurchasePrice = investment.totalInvested / investment.quantity;
        const profitLoss = (stockData.price - avgPurchasePrice) * quantity;
        const profitLossPercent = ((stockData.price - avgPurchasePrice) / avgPurchasePrice) * 100;

        res.json({
            success: true,
            message: `Successfully sold ${quantity} shares of ${investment.symbol} for $${saleAmount.toFixed(2)}`,
            data: {
                saleAmount: saleAmount.toFixed(2),
                profitLoss: profitLoss.toFixed(2),
                profitLossPercent: profitLossPercent.toFixed(2),
                newCashBalance: newCashBalance
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error selling investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error selling investment'
        });
    }
};

// Delete investment
const deleteInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const investment = await Investment.findOne({
            where: { id, userId }
        });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        await investment.destroy();
        
        res.json({
            success: true,
            message: 'Investment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting investment'
        });
    }
};

// Get user's cash balance
const getCashBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['cashBalance']
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                cashBalance: parseFloat(user.cashBalance).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error getting cash balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cash balance'
        });
    }
};

// Add cash to user's account (simulate deposit)
const addCash = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }
        
        const user = await User.findByPk(userId);
        const newBalance = (parseFloat(user.cashBalance) + parseFloat(amount)).toFixed(2);
        
        await user.update({
            cashBalance: newBalance
        });
        
        res.json({
            success: true,
            message: `Successfully added $${parseFloat(amount).toFixed(2)} to your account`,
            data: {
                newBalance: newBalance
            }
        });
    } catch (error) {
        console.error('Error adding cash:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding cash'
        });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const transactions = await Transaction.findAll({
            where: { userId },
            order: [['transactionDate', 'DESC']],
            limit: 50
        });
        
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error getting transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving transaction history'
        });
    }
};

module.exports = {
    getAllInvestments,
    getInvestmentById,
    createInvestment,
    updateInvestment: sellInvestment, // Rename to better reflect selling
    deleteInvestment,
    sellInvestment,
    getCashBalance,
    addCash,
    getTransactionHistory
};