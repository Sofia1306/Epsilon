const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Investment = require('./Investment');
const Transaction = require('./Transaction');

// Define associations
User.hasMany(Investment, { foreignKey: 'userId' });
Investment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Investment,
    Transaction
};
