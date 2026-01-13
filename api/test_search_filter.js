/**
 * Test Script for Marketplace Search & Filter API
 * Using native http module for Node.js compatibility
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;
const PATH = '/api/marketplace/products';

function testAPI(testName, queryParams) {
    return new Promise((resolve) => {
        const queryString = new URLSearchParams(queryParams).toString();
        const fullPath = queryString ? `${PATH}?${queryString}` : PATH;

        console.log(`\n🧪 Testing: ${testName}`);
        console.log(`📡 URL: http://${BASE_URL}:${PORT}${fullPath}`);

        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: fullPath,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);

                    if (res.statusCode === 200) {
                        console.log(`✅ Success! Found ${jsonData.data?.length || 0} products`);
                        if (jsonData.data && jsonData.data.length > 0) {
                            const first = jsonData.data[0];
                            console.log(`   First: ${first.title} - Rp ${Number(first.price).toLocaleString('id-ID')}`);
                        }
                    } else {
                        console.log(`❌ Error (${res.statusCode}): ${jsonData.error}`);
                    }
                } catch (error) {
                    console.log(`❌ Parse error: ${error.message}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Request failed: ${error.message}`);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Marketplace Search & Filter API Tests\n');
    console.log('='.repeat(60));

    await testAPI('1. Basic Product Listing', {});
    await testAPI('2. Search: "kopi"', { search: 'kopi' });
    await testAPI('3. Filter: Category = kuliner', { category: 'kuliner' });
    await testAPI('4. Filter: Price 10k - 50k', { minPrice: '10000', maxPrice: '50000' });
    await testAPI('5. Filter: In Stock Only', { inStock: 'true' });
    await testAPI('6. Sort: Price Low to High', { sortBy: 'price', sortOrder: 'asc' });
    await testAPI('7. Sort: Price High to Low', { sortBy: 'price', sortOrder: 'desc' });
    await testAPI('8. Sort: Newest First', { sortBy: 'createdAt', sortOrder: 'desc' });
    await testAPI('9. Combined Filters', {
        search: 'kopi',
        category: 'kuliner',
        minPrice: '20000',
        maxPrice: '100000',
        inStock: 'true',
        sortBy: 'price',
        sortOrder: 'asc'
    });
    await testAPI('10. Invalid sortBy (should fail)', { sortBy: 'invalid_field' });
    await testAPI('11. Invalid sortOrder (should fail)', { sortOrder: 'invalid_order' });

    console.log('\n' + '='.repeat(60));
    console.log('✨ All tests completed!\n');
}

runTests().catch(console.error);
