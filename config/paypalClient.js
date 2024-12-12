const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');

dotenv.config();

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (process.env.PAYPAL_MODE === 'sandbox') {
        return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    } else {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
}

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
