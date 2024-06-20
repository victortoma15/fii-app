const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get("/:teacherId", async (req, res) => {
    const { teacherId } = req.params;

    try {
        // Fetch the teacher and their subject details
        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacherId, 10) }, // Changed from user_id to id
            include: {
                subject: true
            }
        });

        if (!teacher) {
            console.error("Teacher not found for ID:", teacherId);
            return res.status(404).json({ message: "Teacher not found" });
        }

        const { id: subject_id, year } = teacher.subject;
        console.log("Found teacher:", teacher);

        // Fetch all students in the same year
        const students = await prisma.student.findMany({
            where: {
                year: year
            },
            include: {
                user: true,
                grades: {
                    where: {
                        subject_id: subject_id,
                        teacher_id: teacher.id
                    }
                }
            },
            orderBy: {
                user: { last_name: 'asc' }
            }
        });

        if (students.length === 0) {
            console.error("No students found for year:", year);
        }

        console.log("Found students:", students);

        const studentData = students.map(student => ({
            student_id: student.student_id,
            first_name: student.user.first_name,
            last_name: student.user.last_name,
            group: student.group,
            grade: student.grades.length > 0 ? student.grades[0].grade : null
        }));

        console.log("Formatted student data:", studentData);

        res.status(200).json(studentData);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
