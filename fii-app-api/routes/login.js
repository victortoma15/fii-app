const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request for email:', email.trim());

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
            include: { Student: true, Teacher: true } // Include Teacher relation
        });

        if (!user) {
            console.log('No user found for email:', email.trim());
            return res.status(404).json({ message: "User not found" });
        }

        console.log('Stored hash:', user.password);
        const isPasswordValid = await bcrypt.compare(password.trim(), user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Failed login attempt for email:', email.trim());
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated for user:', user.id);

        // Fetch the subject ID and teacher ID for the teacher
        let subjectId = null;
        let subjectYear = null;
        let teacherId = null;
        if (user.is_teacher) {
            const teacher = await prisma.teacher.findUnique({
                where: { user_id: user.id },
                include: { subject: true }
            });
            if (teacher) {
                subjectId = teacher.subject_id;
                subjectYear = teacher.subject.year; // Get the subject year
                teacherId = teacher.id; // Get the teacher id
            }
        }

        res.status(200).json({
            token,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name} ${user.last_name}`,
            teacherId: user.is_teacher ? teacherId : null, // Use the correct teacher id
            studentId: user.Student ? user.Student.id : null, // Ensure studentId is included
            role: user.is_teacher ? 'teacher' : 'student',
            year: user.Student ? user.Student.year : null,
            group: user.Student ? user.Student.group : null,
            subjectId, // Include subject ID for the teacher
            subjectYear // Include subject year for the teacher
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
