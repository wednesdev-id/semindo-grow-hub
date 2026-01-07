
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

async function verify() {
    try {
        // 1. Register Mock Consultant if not exists (or login)
        console.log('Attempting login as consultant...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'consultant@example.com',
                password: 'password123'
            });
            token = loginRes.data.data.token;
            console.log('Login successful.');
        } catch (e) {
            console.log('Login failed, creating consultant...');
            // In real flow we'd register, but for now let's assume we might need to register
            // Actually, let's try to register if login fails
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                fullName: "Consultant John",
                email: "consultant@example.com",
                password: "password123",
                role: "consultant"
            });
            token = regRes.data.data.token;
            console.log('Registration successful.');
        }

        // 2. Call Consultant Product Endpoint
        console.log('Calling getConsultantClientsProducts...');
        const productsRes = await axios.get(`${API_URL}/marketplace/consultant/clients/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Consultant Products Response Status:', productsRes.status);
        console.log('Product Count:', productsRes.data.products.length);
        if (productsRes.data.products.length > 0) {
            console.log('First Product:', JSON.stringify(productsRes.data.products[0], null, 2));
            if (productsRes.data.products[0].store && productsRes.data.products[0].store.user) {
                console.log('Client Info present:', productsRes.data.products[0].store.user.fullName);
            } else {
                // It's okay if store/user structure is different as long as we have the data we formatted in service
                // Actually the raw response from service has "store" object.
            }
        } else {
            console.log('No products found.');
        }

    } catch (error: any) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verify();
