const { Pool } = require('pg');

const testConnection = async (url) => {
    console.log(`Testing: ${url}`);
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 });
    try {
        const client = await pool.connect();
        console.log('SUCCESS!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
        client.release();
        return true;
    } catch (err) {
        console.error('FAILED:', err.message);
        return false;
    } finally {
        await pool.end();
    }
};

const main = async () => {
    const urls = [
        'postgresql://postgres@localhost:5432/postgres',
        'postgresql://postgres:postgres@localhost:5432/postgres',
        'postgresql://postgres:admin@localhost:5432/postgres',
        'postgresql://postgres:semindo_password@localhost:5432/postgres',
        'postgresql://semindo@localhost:5432/semindo_db',
        'postgresql://semindo:semindo_password@localhost:5432/semindo_db',
    ];

    for (const url of urls) {
        if (await testConnection(url)) break;
    }
};

main();
