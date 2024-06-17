const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get("/:student_id", async (req, res) => {
    const { student_id } = req.params;

    try {
        // Ensure the student_id is correctly parsed as an integer
        const studentId = parseInt(student_id, 10);

        // Check if studentId is a valid number
        if (isNaN(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const grades = await prisma.grade.findMany({
            where: { student_id: studentId },
            include: {
                subject: true,
                teacher: {
                    select: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
