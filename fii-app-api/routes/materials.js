const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const ensureTeacher = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (user && user.is_teacher) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
};

// Fetch pending materials for a teacher by subject
router.get('/pending/:teacherId/:subjectId', authenticateJWT, ensureTeacher, async (req, res) => {
  const { teacherId, subjectId } = req.params;
  const parsedTeacherId = parseInt(teacherId);
  const parsedSubjectId = parseInt(subjectId);

  console.log(`Fetching pending materials for teacherId: ${parsedTeacherId}, subjectId: ${parsedSubjectId}`);

  try {
    // Check if the teacher is associated with the subject
    const subjects = await prisma.subject.findMany({
      where: {
        id: parsedSubjectId,
        teachers: {
          some: {
            user_id: parsedTeacherId,
          },
        },
      },
    });

    console.log('Fetched subjects:', subjects); // Log the subjects fetched

    const subjectIds = subjects.map((subject) => subject.id);
    console.log('Subject IDs:', subjectIds); // Log the subject IDs

    if (subjectIds.length === 0) {
      console.log('No subjects found for this teacher.');
      return res.status(200).json([]); // No subjects found
    }

    const pendingMaterials = await prisma.material.findMany({
      where: {
        subject_id: {
          in: subjectIds,
        },
        approved: false,
      },
      include: {
        uploader: true,
        subject: true,
      },
    });

    console.log('Pending materials:', pendingMaterials); // Log the pending materials

    res.status(200).json(pendingMaterials);
  } catch (error) {
    console.error('Error fetching pending materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch materials by subject ID and category
router.get('/:subjectId/:category', authenticateJWT, async (req, res) => {
  const { subjectId, category } = req.params;
  const parsedSubjectId = parseInt(subjectId);

  console.log(`Fetching materials for subjectId: ${parsedSubjectId}, category: ${category}`);

  try {
    const materials = await prisma.material.findMany({
      where: {
        subject_id: parsedSubjectId,
        category: category,
        approved: true,
      },
    });
    res.status(200).json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch approved materials by subject ID and category
router.get('/:subjectId/:category/approved', authenticateJWT, async (req, res) => {
  const { subjectId, category } = req.params;
  const parsedSubjectId = parseInt(subjectId);

  console.log(`Fetching approved materials for subjectId: ${parsedSubjectId}, category: ${category}`);

  try {
    const materials = await prisma.material.findMany({
      where: {
        subject_id: parsedSubjectId,
        category: category,
        approved: true,
      },
      include: {
        uploader: true,
        subject: true,
      },
    });
    res.status(200).json(materials);
  } catch (error) {
    console.error('Error fetching approved materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload a file
router.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  const { subject_id, category } = req.body;
  const file = req.file;
  const parsedSubjectId = parseInt(subject_id);

  console.log(`Uploading file for subject_id: ${parsedSubjectId}, category: ${category}, file: ${file.originalname}`);

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const material = await prisma.material.create({
      data: {
        name: file.originalname,
        type: file.mimetype,
        path: file.path,
        subject_id: parsedSubjectId,
        category: category,
        uploaded_by: user.id,
        approved: user.is_teacher, // auto approve if teacher
      },
      include: {
        uploader: true,
      },
    });

    console.log('Material uploaded:', material);
    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve a material
router.post('/approve/:id', authenticateJWT, ensureTeacher, async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  try {
    const material = await prisma.material.update({
      where: { id: parsedId },
      data: { approved: true },
    });

    res.status(200).json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deny a material
router.post('/deny/:id', authenticateJWT, ensureTeacher, async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  try {
    await prisma.material.delete({
      where: { id: parsedId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
