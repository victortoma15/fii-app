const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const { teacher_id, student_id, grade } = req.body;

    if (!teacher_id) {
        return res.status(400).json({ message: "Teacher ID is required" });
    }

    try {
        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacher_id, 10) } 
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const student = await prisma.student.findUnique({
            where: { student_id: parseInt(student_id, 10) }
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const existingGrade = await prisma.grade.findFirst({
            where: {
                student_id: student.id,
                subject_id: teacher.subject_id,
                teacher_id: teacher.id
            }
        });

        if (existingGrade) {
            return res.status(400).json({ message: "You have already assigned a grade for this student" });
        }

        const newGrade = await prisma.grade.create({
            data: {
                grade: parseInt(grade, 10),
                student_id: student.id,
                subject_id: teacher.subject_id,
                teacher_id: teacher.id
            }
        });

        res.status(201).json({ message: "Grade added successfully", grade: newGrade });
    } catch (error) {
        console.error("Error adding grade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
