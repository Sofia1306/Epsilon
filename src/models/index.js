const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Investment = require('./Investment');
const Transaction = require('./Transaction');

// Define associations
const setupAssociations = () => {
    // User has many Investments
    User.hasMany(Investment, {
        foreignKey: 'userId',
        as: 'investments',
        onDelete: 'CASCADE'
    });

    // Investment belongs to User
    Investment.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // User has many Transactions
    User.hasMany(Transaction, {
        foreignKey: 'userId',
        as: 'transactions',
        onDelete: 'CASCADE'
    });

    // Transaction belongs to User
    Transaction.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    console.log('✅ Model associations configured');
};

// Setup associations when this module is loaded
setupAssociations();

// Export models and sequelize
module.exports = {
    sequelize,
    User,
    Investment,
    Transaction,
    setupAssociations
};
