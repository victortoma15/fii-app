const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET; // Use a secure key in your environment variables

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'Token is required' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token is required' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
    req.userId = decoded.userId;
    console.log('Decoded User ID:', decoded.userId);
    next();
  });
};

router.get('/details/:user_id', verifyToken, async (req, res) => {
  const userId = req.userId;
  console.log('Using User ID:', userId); // Log statement

  try {
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        is_teacher: true,
        Student: {
          select: {
            student_id: true,
            year: true,
            group: true,
          },
        },
        Teacher: {
          select: {
            teacher_id: true,
            degree: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update email
router.put('/:user_id/email', verifyToken, async (req, res) => {
  const { email } = req.body;
  const userId = req.userId;

  console.log(`Updating email for user ID: ${userId}`);


  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { email },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update password
router.put('/:user_id/password', verifyToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.userId;

  console.log(`Updating password for user ID: ${userId}`);

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
