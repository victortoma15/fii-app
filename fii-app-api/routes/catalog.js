const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get('/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const grades = await prisma.grade.findMany({
      where: { student_id: parseInt(studentId, 10) },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!grades) {
      return res.status(404).json({ error: 'Grades not found for the student' });
    }

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
