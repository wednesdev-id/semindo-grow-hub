
const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 8080,
    path: '/api/v1/marketplace/search?limit=20&stockStatus=all&sortBy=newest',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message} (${e.code})`);
});

req.end();
