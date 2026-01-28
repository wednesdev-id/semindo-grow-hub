import { db } from './src/systems/utils/db';

async function main() {
    console.log('--- DB CONNECTION TEST ---');
    try {
        console.log('Connecting to database...');
        await db.$connect();
        console.log('✅ SUCCESS: Connected to database');

        const count = await db.user.count();
        console.log(`✅ Data Access: Found ${count} users`);
    } catch (error) {
        console.error('❌ FAILED: Database connection error');
        console.error(error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();
