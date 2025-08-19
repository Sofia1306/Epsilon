const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'portfolio_management',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'n3u3da!',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

// Test database connection
const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        
        // If database doesn't exist, try to create it
        if (error.original && error.original.code === 'ER_BAD_DB_ERROR') {
            console.log('🔧 Database does not exist. Attempting to create...');
            try {
                await createDatabase();
                await sequelize.authenticate();
                console.log('✅ Database created and connection established');
                return true;
            } catch (createError) {
                console.error('❌ Failed to create database:', createError.message);
                return false;
            }
        }
        return false;
    }
};

// Create database if it doesn't exist
const createDatabase = async () => {
    const { Sequelize } = require('sequelize');
    
    const tempSequelize = new Sequelize(
        '', // No database specified
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'n3u3da!',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false
        }
    );
    
    try {
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'portfolio_management'}\`;`);
        console.log(`✅ Database '${process.env.DB_NAME || 'portfolio_management'}' created successfully`);
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        throw error;
    } finally {
        await tempSequelize.close();
    }
};

// Initialize database with tables
const initializeDatabase = async () => {
    try {
        console.log('🔧 Initializing database...');
        
        // Test connection first
        const connected = await connectToDatabase();
        if (!connected) {
            throw new Error('Cannot connect to database');
        }

        // Import models to ensure they're loaded
        require('../models');
        
        // Sync database (create tables)
        await sequelize.sync({ 
            force: false, // Don't drop existing tables
            alter: process.env.NODE_ENV === 'development' // Alter tables in development
        });
        
        console.log('✅ Database tables synchronized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    connectToDatabase,
    initializeDatabase
};