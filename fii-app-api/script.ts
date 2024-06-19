import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';

dotenv.config();

const loginRouter = require('./routes/login') as express.Router;
const registerRouter = require('./routes/register') as express.Router;
const calendarRouter = require('./routes/calendar') as express.Router;
const gradesRouter = require('./routes/catalog') as express.Router;
const logoutRouter = require('./routes/logout') as express.Router;
const addGradeRouter = require('./routes/addGrade') as express.Router;
const getGradesRouter = require('./routes/getGrades') as express.Router;
const getStudentsByYearRouter = require('./routes/getStudentsByYear') as express.Router; // Add this line
const getTeacherDetailsRouter = require('./routes/getTeacherDetails') as express.Router; // Add this line
const updateGradeRouter = require('./routes/updateGrade') as express.Router; // Add this line
const materialsRouter = require('./routes/materials') as express.Router;
const subjectsRouter = require('./routes/subjects') as express.Router;
const profileRouter = require('./routes/getUserDetails') as express.Router; // New line

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/calendar', calendarRouter);
app.use('/catalog', gradesRouter);
app.use('/logout', logoutRouter);
app.use('/addGrade', addGradeRouter);
app.use('/getGrades', getGradesRouter);
app.use('/studentsByYear', getStudentsByYearRouter); // Add this line
app.use('/teacher', getTeacherDetailsRouter); // Add this line
app.use('/updateGrade', updateGradeRouter); // Add this line
app.use('/materials', materialsRouter);
app.use('/subjects', subjectsRouter);
app.use('/users', profileRouter); // New line

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.REDIRECT_URI
);
