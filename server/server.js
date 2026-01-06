const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { pgPool, connectMongo } = require('./config/db'); // Ensure you have created this file from the previous step
const User = require('./models/User');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Connections
connectMongo();

// --- ROUTE 1: Verify Citizen Identity (Read from PostgreSQL) ---
app.post('/api/verify-citizen', async (req, res) => {
    const { citizenId } = req.body;

    if (!citizenId) {
        return res.status(400).json({ success: false, message: "Citizen ID is required" });
    }

    try {
        // Query the Government Node
        const query = 'SELECT * FROM citizens WHERE citizen_id = $1';
        const result = await pgPool.query(query, [citizenId]);

        if (result.rows.length > 0) {
            // Citizen found
            res.json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Citizen ID not found in Government Registry." });
        }
    } catch (err) {
        console.error("PG Error:", err);
        res.status(500).json({ success: false, message: "Server Error: Could not query Government Node" });
    }
});

// --- ROUTE 2: Register User (Write to MongoDB) ---
app.post('/api/register', async (req, res) => {
    const { username, password, citizenId } = req.body;

    if (!username || !password || !citizenId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // 1. Check if Username exists in Mongo
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: "Username already taken" });

        // 2. Check if Citizen ID is already registered in Mongo
        const citizenRegistered = await User.findOne({ citizenId });
        if (citizenRegistered) return res.status(400).json({ message: "This Citizen ID is already associated with an account" });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const newUser = new User({
            username,
            password: hashedPassword,
            citizenId
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// --- ROUTE 3: Login (Read Mongo + Read Postgres) ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find User in MongoDB
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid username or password" });

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

        // 3. Fetch Contact Details from Postgres (for 2FA)
        const pgQuery = 'SELECT email, mobile, full_name, citizen_id FROM citizens WHERE citizen_id = $1';
        const pgResult = await pgPool.query(pgQuery, [user.citizenId]);

        if (pgResult.rows.length === 0) {
            return res.status(500).json({ message: "Critical Error: Linked Citizen Record not found" });
        }

        const citizenData = pgResult.rows[0];

        // 4. Return success (Frontend will handle 2FA)
        res.json({
            success: true,
            user: {
                username: user.username,
                fullName: citizenData.full_name,
                email: citizenData.email,
                mobile: citizenData.mobile,
                citizenId: citizenData.citizen_id
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));