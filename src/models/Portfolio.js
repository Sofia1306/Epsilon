const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Portfolio extends Model {}

Portfolio.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    netInvestment: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    cashFlow: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Portfolio',
    tableName: 'portfolios'
});

module.exports = Portfolio;