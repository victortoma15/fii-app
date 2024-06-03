const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const { teacher_id, student_id, grade } = req.body;

    console.log("Received teacher_id:", teacher_id); // Log teacher_id for debugging

    if (!teacher_id) {
        return res.status(400).json({ message: "Teacher ID is required" });
    }

    try {
        // Fetch the teacher to get their subject_id
        const teacher = await prisma.teacher.findUnique({
            where: { user_id: parseInt(teacher_id, 10) } // Changed to user_id
        });

        if (!teacher) {
            console.log("Teacher not found for ID:", teacher_id);
            return res.status(404).json({ message: "Teacher not found" });
        }

        console.log("Found teacher:", teacher);

        // Check if the student exists
        const student = await prisma.student.findUnique({
            where: { student_id: parseInt(student_id, 10) }
        });

        if (!student) {
            console.log("Student not found for ID:", student_id);
            return res.status(404).json({ message: "Student not found" });
        }

        console.log("Found student:", student);

        // Create the grade entry
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
