const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get("/:teacherId", async (req, res) => {
    const { teacherId } = req.params;

    try {
        const teacher = await prisma.teacher.findUnique({
            where: { user_id: parseInt(teacherId, 10) },
            select: {
                subject: {
                    select: {
                        year: true,
                        id: true
                    }
                }
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({ year: teacher.subject.year, subjectId: teacher.subject.id });
    } catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
