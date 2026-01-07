
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

async function verify() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'seller@example.com',
            password: 'password123'
        });
        const token = loginRes.data.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Call Admin Endpoint
        console.log('Calling getAdminProducts...');
        const adminRes = await axios.get(`${API_URL}/marketplace/admin/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Admin Products Response Status:', adminRes.status);
        console.log('Product Count:', adminRes.data.products.length);
        if (adminRes.data.products.length > 0) {
            console.log('First Product:', JSON.stringify(adminRes.data.products[0], null, 2));
            if (adminRes.data.products[0].store && adminRes.data.products[0].store.user) {
                console.log('Seller Info present:', adminRes.data.products[0].store.user.fullName);
            } else {
                console.error('Seller Info MISSING in response!');
            }
        } else {
            console.log('No products found (which might be valid if DB is empty).');
        }

    } catch (error: any) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verify();
