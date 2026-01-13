
require('dotenv').config();

console.log('MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? (process.env.MIDTRANS_SERVER_KEY.substring(0, 5) + '...') : 'UNDEFINED');
console.log('MIDTRANS_CLIENT_KEY:', process.env.MIDTRANS_CLIENT_KEY ? (process.env.MIDTRANS_CLIENT_KEY.substring(0, 5) + '...') : 'UNDEFINED');
console.log('MIDTRANS_IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION);
