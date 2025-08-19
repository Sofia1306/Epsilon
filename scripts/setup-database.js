const { initializeDatabase, resetDatabase } = require('../src/config/database');

const setupType = process.argv[2] || 'init';

const runSetup = async () => {
    try {
        console.log('🔧 Database Setup Script');
        console.log('========================\n');
        
        switch (setupType) {
            case 'init':
                console.log('Initializing database...');
                await initializeDatabase();
                break;
                
            case 'reset':
                console.log('⚠️  RESETTING DATABASE (ALL DATA WILL BE LOST)...');
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                rl.question('Are you sure? Type "yes" to confirm: ', async (answer) => {
                    if (answer.toLowerCase() === 'yes') {
                        await resetDatabase();
                        console.log('✅ Database reset completed.');
                    } else {
                        console.log('❌ Database reset cancelled.');
                    }
                    rl.close();
                    process.exit(0);
                });
                return;
                
            default:
                console.log('Usage: node scripts/setup-database.js [init|reset]');
                process.exit(1);
        }
        
        console.log('\n🎉 Database setup completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

runSetup();
