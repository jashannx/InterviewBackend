import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors'; 
import helmet from 'helmet';

import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
app.set('trust proxy', 1)
app.use(helmet());
const PORT = process.env.PORT || 4000;
// GLOBAL LIGHT LIMITER
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);


// AI ROUTE STRICT LIMITER
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 50,

  message: {
    success: false,
    message:
      "AI request limit exceeded. Try again later.",
  },
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,

  delayAfter: 5,

  delayMs: () => 1000,
});
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)
  
import cookieParser from 'cookie-parser';
app.use(cookieParser());
import authRouter from './src/routes/auth.routes.js';
import interviewRouter from './src/routes/interview.routes.js';
app.use(express.json());

import connectDB from './src/config/database.js';
connectDB();
app.use('/api/auth', authRouter);
app.use('/api/interview',aiLimiter,speedLimiter, interviewRouter);
// generateInterviewReport({
//   resume: "MERN stack developer with React and Node.js experience",
//   selfdescription: "Passionate backend developer",
//   jobdescription: "Looking for a full stack developer with MongoDB and Express skills",
// });

app.get('/', (req, res) => {
  res.send('Server working perfectly sir ');
});
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
});