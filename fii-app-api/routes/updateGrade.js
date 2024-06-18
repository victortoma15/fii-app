const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.put("/", async (req, res) => {
    const { teacher_id, student_id, grade } = req.body;

    if (!teacher_id) {
        return res.status(400).json({ message: "Teacher ID is required" });
    }

    try {
        // Fetch the teacher to get their subject_id
        const teacher = await prisma.teacher.findUnique({
            where: { user_id: parseInt(teacher_id, 10) }
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Check if the student exists
        const student = await prisma.student.findUnique({
            where: { student_id: parseInt(student_id, 10) }
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update the grade entry
        const updatedGrade = await prisma.grade.updateMany({
            where: {
                student_id: student.id,
                subject_id: teacher.subject_id,
                teacher_id: teacher.id
            },
            data: {
                grade: parseInt(grade, 10)
            }
        });

        if (updatedGrade.count === 0) {
            return res.status(404).json({ message: "Grade not found" });
        }

        res.status(200).json({ message: "Grade updated successfully" });
    } catch (error) {
        console.error("Error updating grade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
