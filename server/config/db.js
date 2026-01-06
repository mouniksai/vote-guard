const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// --- 1. PostgreSQL Connection ---
const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// TEST CODE: Force a connection attempt immediately
pgPool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error acquiring client', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL (Govt Node)');
        client.release();
    }
});

// --- 2. MongoDB Connection ---
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB (App State)");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
};

module.exports = { pgPool, connectMongo };