
const axios = require('axios');

const API_URL = 'http://localhost:8080/api/v1';

async function runCheckout() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo@example.com',
            password: 'password123'
        });
        console.log('Login Response:', loginRes.data);
        const token = loginRes.data.token || loginRes.data.data?.token;
        console.log('Token:', token);

        // 2. Create Order
        console.log('Creating Order...');
        const productItem = {
            productId: '8e982230-1064-4357-bb44-762ddbc29431', // Kopi Arabica
            quantity: 1
        };

        // Note: API expects array of items
        const orderRes = await axios.post(`${API_URL}/marketplace/orders`, {
            items: [productItem],
            paymentMethod: 'bca_va',
            shippingAddress: {
                recipientName: "Demo User",
                phone: "08123456789",
                addressLine1: "Jl. Sudirman No. 1",
                city: "Jakarta",
                postalCode: "12190"
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const order = orderRes.data.data; // API usually returns { data: order }
        console.log('Order created:', order.id);
        console.log('Payment Link:', order.paymentLink);

        // 3. Get Order Details via Check Payment Status (or Get Order)
        console.log('Checking Order Details...');
        const checkRes = await axios.post(`${API_URL}/marketplace/orders/${order.id}/check-payment`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const paymentData = checkRes.data.paymentData;
        console.log('Payment Data:', JSON.stringify(paymentData, null, 2));

        if (paymentData && paymentData.va_numbers) {
            console.log('✅ VA Numbers found:', paymentData.va_numbers[0].va_number);
        } else {
            console.log('❌ VA Numbers NOT found in paymentData');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

runCheckout();
