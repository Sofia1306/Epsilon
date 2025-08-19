const { User, Investment, Transaction } = require('../models');
const financeAPI = require('../services/financeAPI');
const { sequelize } = require('../config/database');

// Get all investments for a user
const getAllInvestments = async (req, res) => {
    try {
        const userId = req.user.id;

        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Update current prices and calculate gains/losses
        const updatedInvestments = await Promise.all(
            investments.map(async (investment) => {
                try {
                    const stockData = await financeAPI.getStockPrice(investment.symbol);
                    const currentPrice = stockData ? stockData.price : investment.purchasePrice;
                    
                    // Update investment with current price
                    await investment.update({ currentPrice });

                    const currentValue = currentPrice * investment.quantity;
                    const gainLoss = currentValue - investment.totalInvested;
                    const gainLossPercent = investment.totalInvested > 0 ? 
                        (gainLoss / investment.totalInvested) * 100 : 0;

                    return {
                        ...investment.toJSON(),
                        currentPrice: parseFloat(currentPrice),
                        currentValue: parseFloat(currentValue.toFixed(2)),
                        gainLoss: parseFloat(gainLoss.toFixed(2)),
                        gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
                        companyName: stockData?.shortName || investment.companyName
                    };
                } catch (error) {
                    console.error(`Error updating price for ${investment.symbol}:`, error);
                    
                    const currentValue = investment.purchasePrice * investment.quantity;
                    return {
                        ...investment.toJSON(),
                        currentPrice: parseFloat(investment.purchasePrice),
                        currentValue: parseFloat(currentValue.toFixed(2)),
                        gainLoss: 0,
                        gainLossPercent: 0
                    };
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
            message: 'Error obteniendo inversiones'
        });
    }
};

// Get specific investment by ID
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
                message: 'Inversión no encontrada'
            });
        }

        // Get current stock price
        try {
            const stockData = await financeAPI.getStockPrice(investment.symbol);
            const currentPrice = stockData ? stockData.price : investment.purchasePrice;
            
            await investment.update({ currentPrice });

            const currentValue = currentPrice * investment.quantity;
            const gainLoss = currentValue - investment.totalInvested;
            const gainLossPercent = investment.totalInvested > 0 ? 
                (gainLoss / investment.totalInvested) * 100 : 0;

            res.json({
                success: true,
                data: {
                    ...investment.toJSON(),
                    currentPrice: parseFloat(currentPrice),
                    currentValue: parseFloat(currentValue.toFixed(2)),
                    gainLoss: parseFloat(gainLoss.toFixed(2)),
                    gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
                    companyName: stockData?.shortName || investment.companyName
                }
            });
        } catch (error) {
            console.error(`Error getting current price for ${investment.symbol}:`, error);
            res.json({
                success: true,
                data: investment.toJSON()
            });
        }

    } catch (error) {
        console.error('Error getting investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo inversión'
        });
    }
};

// Create new investment (buy stocks)
const createInvestment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { symbol, quantity } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!symbol || !quantity || quantity <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Símbolo y cantidad válida son requeridos'
            });
        }

        // Get current stock price
        const stockData = await financeAPI.getStockPrice(symbol.toUpperCase());
        if (!stockData) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No se pudo obtener el precio de la acción'
            });
        }

        const currentPrice = stockData.price;
        const totalCost = currentPrice * quantity;

        // Get user's current cash balance
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Check if user has enough cash
        if (parseFloat(user.cashBalance) < totalCost) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Fondos insuficientes. Necesitas $${totalCost.toFixed(2)} pero solo tienes $${parseFloat(user.cashBalance).toFixed(2)}`
            });
        }

        // Check if user already has this stock
        let investment = await Investment.findOne({
            where: { userId, symbol: symbol.toUpperCase() },
            transaction
        });

        if (investment) {
            // Update existing investment (average price calculation)
            const newTotalQuantity = investment.quantity + quantity;
            const newTotalInvested = investment.totalInvested + totalCost;
            const newAveragePrice = newTotalInvested / newTotalQuantity;

            await investment.update({
                quantity: newTotalQuantity,
                purchasePrice: newAveragePrice,
                totalInvested: newTotalInvested,
                currentPrice: currentPrice,
                companyName: stockData.shortName || investment.companyName
            }, { transaction });
        } else {
            // Create new investment
            investment = await Investment.create({
                userId,
                symbol: symbol.toUpperCase(),
                companyName: stockData.shortName,
                quantity,
                purchasePrice: currentPrice,
                currentPrice,
                totalInvested: totalCost,
                purchaseDate: new Date()
            }, { transaction });
        }

        // Update user's cash balance
        const newCashBalance = parseFloat(user.cashBalance) - totalCost;
        await user.update({ cashBalance: newCashBalance }, { transaction });

        // Record transaction
        await Transaction.create({
            userId,
            symbol: symbol.toUpperCase(),
            transactionType: 'BUY',
            quantity,
            price: currentPrice,
            totalAmount: totalCost,
            transactionDate: new Date()
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: `Compra exitosa: ${quantity} acciones de ${symbol.toUpperCase()} por $${totalCost.toFixed(2)}`,
            data: {
                investment: investment.toJSON(),
                remainingCash: newCashBalance,
                transactionDetails: {
                    symbol: symbol.toUpperCase(),
                    quantity,
                    pricePerShare: currentPrice,
                    totalCost
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando la compra'
        });
    }
};

// Sell stock
const sellInvestment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!quantity || quantity <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cantidad válida es requerida'
            });
        }

        // Find investment
        const investment = await Investment.findOne({
            where: { id, userId },
            transaction
        });

        if (!investment) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Inversión no encontrada'
            });
        }

        // Check if user has enough shares
        if (investment.quantity < quantity) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `No tienes suficientes acciones. Tienes ${investment.quantity} pero intentas vender ${quantity}`
            });
        }

        // Get current stock price
        const stockData = await financeAPI.getStockPrice(investment.symbol);
        const currentPrice = stockData ? stockData.price : investment.purchasePrice;

        const saleValue = currentPrice * quantity;
        const costBasis = investment.purchasePrice * quantity;
        const profitLoss = saleValue - costBasis;
        const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

        // Get user
        const user = await User.findByPk(userId, { transaction });

        if (investment.quantity === quantity) {
            // Selling all shares - delete investment
            await investment.destroy({ transaction });
        } else {
            // Partial sale - update investment
            const remainingQuantity = investment.quantity - quantity;
            const remainingInvested = investment.totalInvested - costBasis;

            await investment.update({
                quantity: remainingQuantity,
                totalInvested: remainingInvested,
                currentPrice
            }, { transaction });
        }

        // Update user's cash balance
        const newCashBalance = parseFloat(user.cashBalance) + saleValue;
        await user.update({ cashBalance: newCashBalance }, { transaction });

        // Record transaction
        await Transaction.create({
            userId,
            symbol: investment.symbol,
            transactionType: 'SELL',
            quantity,
            price: currentPrice,
            totalAmount: saleValue,
            transactionDate: new Date()
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: `Venta exitosa: ${quantity} acciones de ${investment.symbol} por $${saleValue.toFixed(2)}`,
            data: {
                saleDetails: {
                    symbol: investment.symbol,
                    quantity,
                    pricePerShare: currentPrice,
                    saleValue,
                    costBasis,
                    profitLoss: parseFloat(profitLoss.toFixed(2)),
                    profitLossPercent: parseFloat(profitLossPercent.toFixed(2))
                },
                newCashBalance,
                remainingShares: investment.quantity === quantity ? 0 : investment.quantity - quantity
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error selling investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando la venta'
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
                message: 'Inversión no encontrada'
            });
        }

        await investment.destroy();

        res.json({
            success: true,
            message: 'Inversión eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando inversión'
        });
    }
};

// Get cash balance
const getCashBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                cashBalance: parseFloat(user.cashBalance),
                userId
            }
        });

    } catch (error) {
        console.error('Error getting cash balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo balance de efectivo'
        });
    }
};

// Add cash to account
const addCash = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad válida es requerida'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Update cash balance
        const newBalance = parseFloat(user.cashBalance) + parseFloat(amount);
        await user.update({ cashBalance: newBalance });

        res.json({
            success: true,
            message: `$${parseFloat(amount).toFixed(2)} agregados a tu cuenta exitosamente`,
            data: {
                newBalance: parseFloat(newBalance.toFixed(2)),
                addedAmount: parseFloat(amount)
            }
        });

    } catch (error) {
        console.error('Error adding cash:', error);
        res.status(500).json({
            success: false,
            message: 'Error agregando dinero a la cuenta'
        });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0, type } = req.query;

        const whereClause = { userId };
        if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
            whereClause.transactionType = type.toUpperCase();
        }

        const transactions = await Transaction.findAndCountAll({
            where: whereClause,
            order: [['transactionDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                totalCount: transactions.count,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: transactions.count > (parseInt(offset) + parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Error getting transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo historial de transacciones'
        });
    }
};

module.exports = {
    getAllInvestments,
    getInvestmentById,
    createInvestment,
    sellInvestment,
    deleteInvestment,
    getCashBalance,
    addCash,
    getTransactionHistory
};