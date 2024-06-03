import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

// Use require and type assertions to bypass module declaration issues
const loginRouter = require('./routes/login') as express.Router;
const registerRouter = require('./routes/register') as express.Router;
const calendarRouter = require('./routes/calendar') as express.Router;
const gradesRouter = require('./routes/catalog') as express.Router;
const logoutRouter = require('./routes/logout') as express.Router;
const addGradeRouter = require('./routes/addGrade') as express.Router;
const getGradesRouter = require('./routes/getGrades') as express.Router; // Add this line

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/calendar', calendarRouter);
app.use('/catalog', gradesRouter);
app.use('/logout', logoutRouter);
app.use('/addGrade', addGradeRouter);
app.use('/getGrades', getGradesRouter); // Add this line

app.post('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.REDIRECT_URI
);
