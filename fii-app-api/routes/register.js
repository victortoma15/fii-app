const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const { email, password, firstName, lastName, isStudent } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                is_student: isStudent
            }
        });
        res.status(201).json({ message: "User created", userId: newUser.id });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error creating user" });
    }
});

module.exports = router;
