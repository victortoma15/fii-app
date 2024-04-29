const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request for email:', email.trim()); // Ensure to log trimmed email for consistency

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.trim() }  // Ensure email is trimmed to remove any extra spaces
        });

        if (!user) {
            console.log('No user found for email:', email.trim());  // Log trimmed email in case not found
            return res.status(404).json({ message: "User not found" });
        }

        console.log('Stored hash:', user.password); // Log the stored hash for debugging
        const isPasswordValid = await bcrypt.compare(password.trim(), user.password);  // Also trim the password input
        console.log('Password valid:', isPasswordValid);  // Log the result of the password comparison

        if (!isPasswordValid) {
            console.log('Failed login attempt for email:', email.trim());  // Log failed attempt details
            return res.status(401).json({ message: "Invalid password" });
        }
        
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated for user:', user.id);  // Log token generation for the user
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add general error handler to express to catch any unhandled errors
router.use((err, req, res, next) => {
    console.error('Unhandled error in login route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
