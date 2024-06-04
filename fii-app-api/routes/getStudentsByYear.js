const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get("/:teacherId", async (req, res) => {
    const { teacherId } = req.params;

    try {
        // Fetch the year and subject details for the teacher
        const teacher = await prisma.teacher.findUnique({
            where: { user_id: parseInt(teacherId, 10) },
            include: {
                subject: true
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const { year } = teacher.subject;

        // Fetch students by the year of the subject
        const students = await prisma.student.findMany({
            where: {
                year: year
            },
            select: {
                student_id: true,
            }
        });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
