import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';

dotenv.config();

const app = express();

// Basic sanity check for required env
if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL is not defined in environment");
  process.exit(1);
}
if (!process.env.JWT_KEY) {
  console.error("JWT_KEY is not defined in environment");
  process.exit(1);
}

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true,
  })
);

// Body parsing
app.use(express.json());

// JWT middleware
app.use((req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err || !decoded) {
        console.log("Invalid token:", err?.message || "unknown reason");
       
        return next();
      }
      req.user = decoded;
      next();
    });
  } else {
    next();
  }
});

// Routers
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
