import express from 'express';
import { PrismaClient } from '@prisma/client';
const loginRouter: any = require('./routes/login'); // Import the login router as any
const registerRouter: any = require('./routes/register'); // Import the register router as any

const prisma = new PrismaClient();

const app = express();
const port = 3000; // Choose your desired port

app.use(express.json());
// Define your routes here
app.use('/login', loginRouter); // Mount the login router at the '/login' endpoint
app.use('/register', registerRouter); // Mount the register router at the '/register' endpoint
app.post('/', async (req, res) => {
  try {
    // Example: Fetch all users from the database
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
});
