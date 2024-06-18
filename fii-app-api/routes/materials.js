const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Serve static files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Verify file existence middleware
const verifyFileExists = (req, res, next) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ message: 'File not found' });
    }
    next();
  });
};

// Serve specific file
router.get('/uploads/:filename', verifyFileExists, (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(filePath);
});

// Fetch pending materials for a teacher by subject
router.get('/pending/:teacherId/:subjectId', authenticateJWT, ensureTeacher, async (req, res) => {
  const { teacherId, subjectId } = req.params;
  const parsedTeacherId = parseInt(teacherId);
  const parsedSubjectId = parseInt(subjectId);

  try {
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

    const subjectIds = subjects.map((subject) => subject.id);

    if (subjectIds.length === 0) {
      return res.status(200).json([]);
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

    // Ensure file_url is included in the response
    materials.forEach(material => {
      material.file_url = `${req.protocol}://${req.get('host')}/uploads/${path.basename(material.path)}`;
    });

    console.log('Fetched materials:', materials);

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

    // Ensure file_url is included in the response
    materials.forEach(material => {
      material.file_url = `${req.protocol}://${req.get('host')}/uploads/${path.basename(material.path)}`;
    });

    console.log('Fetched approved materials:', materials);

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

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    console.log(`File URL generated: ${fileUrl}`);

    const material = await prisma.material.create({
      data: {
        name: file.originalname,
        type: file.mimetype,
        path: file.path,
        subject_id: parsedSubjectId,
        category: category,
        uploaded_by: user.id,
        approved: user.is_teacher,
        file_url: fileUrl,
      },
      include: {
        uploader: true,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading material:', error);
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
    console.error('Error approving material:', error);
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
    console.error('Error denying material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
