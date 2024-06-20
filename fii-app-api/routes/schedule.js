const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get subject year by subject ID
router.get('/subject/year/:subjectId', async (req, res) => {
  const { subjectId } = req.params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId, 10) },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ year: subject.year });
  } catch (error) {
    console.error('Error fetching subject year:', error);
    res.status(500).json({ error: 'Error fetching subject year' });
  }
});

// Add schedule
router.post('/add', async (req, res) => {
  const { day, start_time, end_time, subject_id, teacher_id } = req.body;
  console.log('Add schedule request:', req.body); // Log request body
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subject_id },
    });

    if (!subject) {
      console.log('Subject not found for id:', subject_id);
      return res.status(404).json({ error: 'Subject not found' });
    }

    const existingSchedule = await prisma.schedule.findMany({
      where: {
        day,
        year: subject.year,
        OR: [
          {
            start_time: { lte: end_time },
            end_time: { gte: start_time },
          },
        ],
      },
    });

    if (existingSchedule.length > 0) {
      console.log('Time slot already occupied:', existingSchedule);
      return res.status(400).json({ error: 'Time slot already occupied' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        day,
        start_time,
        end_time,
        year: subject.year,
        subject: { connect: { id: subject_id } },
        teacher: { connect: { id: teacher_id } }, // Use correct teacher_id
      },
    });
    res.json(schedule);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Error adding schedule' });
  }
});

// Get schedules by day and year
router.get('/:day/:year', async (req, res) => {
  const { day, year } = req.params;
  console.log('Fetch schedules request:', { day, year }); // Log request parameters
  const yearInt = parseInt(year, 10);

  try {
    const schedules = await prisma.schedule.findMany({
      where: { day, year: yearInt },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Error fetching schedules' });
  }
});

// Get available intervals by day and year
router.get('/available-intervals/:day/:year', async (req, res) => {
  const { day, year } = req.params;
  const yearInt = parseInt(year, 10);

  try {
    const schedules = await prisma.schedule.findMany({
      where: { day, year: yearInt },
    });

    const timeIntervals = [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '12:00', end: '14:00' },
      { start: '14:00', end: '16:00' },
      { start: '16:00', end: '18:00' },
      { start: '18:00', end: '20:00' },
    ];

    const availableIntervals = timeIntervals.filter(interval => {
      return !schedules.some(schedule =>
        (interval.start >= schedule.start_time && interval.start < schedule.end_time) ||
        (interval.end > schedule.start_time && interval.end <= schedule.end_time)
      );
    });

    res.json(availableIntervals);
  } catch (error) {
    console.error('Error fetching available intervals:', error);
    res.status(500).json({ error: 'Error fetching available intervals' });
  }
});

module.exports = router;
