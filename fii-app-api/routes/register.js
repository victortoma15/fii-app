const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const {
        firstName, lastName, email, password, isTeacher,
        user_id, year, group, subject, degree
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: hashedPassword,
                is_teacher: isTeacher,
                // Conditionally add Student or Teacher data
                ...(isTeacher ? {
                    Teacher: {
                        create: {
                            subject: subject,
                            degree: degree
                        }
                    }
                } : {
                    Student: {
                        create: {
                            user_id: parseInt(user_id, 10),
                            year: parseInt(year, 10),
                            group: group
                        }
                    }
                })
            }
        });

        res.status(201).json({ message: "User registered successfully", userId: newUser.id });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error creating user" });
    }
});

module.exports = router;
