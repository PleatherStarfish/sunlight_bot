// Use dotenv to read .env vars into Node
require('dotenv').config();

module.exports = {
    twitter: {
        consumer_key: process.env.TWIT_KEY,
        consumer_secret: process.env.TWIT_SECRET,
        access_token: process.env.TWIT_TOKEN,
        access_token_secret: process.env.TWIT_TOKEN_SECRET
    },
    db: process.env.PSQL_URL
};