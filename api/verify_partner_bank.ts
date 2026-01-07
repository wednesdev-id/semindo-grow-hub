
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

async function verify() {
    try {
        let partnerToken;
        let bankToken;

        // 1. Partner Verification
        console.log('\n--- Verifying Partner Features ---');
        try {
            // Register Partner
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                fullName: "Partner User",
                email: "partner@example.com",
                password: "password123",
                role: "partner"
            });
            partnerToken = regRes.data.data.token;
            console.log('Partner Registered.');
        } catch (e: any) {
            console.log('Partner Registration skipped (maybe exists), trying login...');
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'partner@example.com',
                password: 'password123'
            });
            partnerToken = loginRes.data.data.token;
            console.log('Partner Login Successful.');
        }

        const exportRes = await axios.get(`${API_URL}/marketplace/partner/opportunities?page=1&limit=5`, {
            headers: { Authorization: `Bearer ${partnerToken}` }
        });
        console.log('Export Opportunities:', exportRes.data.products.length);
        if (exportRes.data.products.length > 0) {
            console.log('First Export Opp:', exportRes.data.products[0].title, '- Price:', exportRes.data.products[0].price);
        }


        // 2. Bank Verification
        console.log('\n--- Verifying Bank Features ---');
        try {
            // Register Bank
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                fullName: "Bank User",
                email: "bank@example.com",
                password: "password123",
                role: "bank"
            });
            bankToken = regRes.data.data.token;
            console.log('Bank Registered.');
        } catch (e: any) {
            console.log('Bank Registration skipped (maybe exists), trying login...');
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'bank@example.com',
                password: 'password123'
            });
            bankToken = loginRes.data.data.token;
            console.log('Bank Login Successful.');
        }

        const financeRes = await axios.get(`${API_URL}/marketplace/bank/candidates?minRevenue=0`, {
            headers: { Authorization: `Bearer ${bankToken}` }
        });
        console.log('Financing Candidates:', financeRes.data.candidates.length);
        if (financeRes.data.candidates.length > 0) {
            console.log('First Candidate:', financeRes.data.candidates[0].name, '- Est Rev:', financeRes.data.candidates[0].estimatedRevenue);
        }

    } catch (error: any) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verify();
