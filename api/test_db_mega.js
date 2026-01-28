const { Pool } = require('pg');

const users = ['postgres', 'semindo', 'admin'];
const passwords = ['semindo_password', 'semindo_password_change_me', 'admin123', 'postgres', 'admin', 'password123', '@sinergi2026', 'password'];
const dbs = ['semindo_db', 'sinergi_umkm', 'postgres'];

const test = async (u, p, d) => {
    const url = `postgresql://${u}:${p}@localhost:5432/${d}`;
    process.stdout.write(`Testing: ${u}:${p}@.../${d} `);
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 1000 });
    try {
        const client = await pool.connect();
        console.log(' -> SUCCESS!');
        client.release();
        return true;
    } catch (err) {
        process.stdout.write(` -> FAILED (${err.code || err.message})\n`);
        return false;
    } finally {
        await pool.end();
    }
};

const run = async () => {
    for (const u of users) {
        for (const p of passwords) {
            for (const d of dbs) {
                if (await test(u, p, d)) {
                    console.log(`\n🎉 FOUND WORKING CREDENTIALS:`);
                    console.log(`URL: postgresql://${u}:${p}@localhost:5432/${d}`);
                    process.exit(0);
                }
            }
        }
    }
    console.log('\n❌ All combinations failed.');
};

run();
