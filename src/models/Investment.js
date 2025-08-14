const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Investment = sequelize.define('Investment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    symbol: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    totalInvested: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    tableName: 'investments',
    timestamps: true
});

module.exports = Investment;