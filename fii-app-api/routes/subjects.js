const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const router = express.Router();

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

router.get('/', authenticateJWT, async (req, res) => {
  const { year } = req.query;

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        year: parseInt(year)
      }
    });
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
