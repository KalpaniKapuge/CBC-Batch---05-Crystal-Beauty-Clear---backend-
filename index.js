import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));


app.use(bodyParser.json());

// JWT middleware
app.use((req, res, next) => {
    const tokenString = req.header("Authorization");

    if (tokenString != null) {
        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err || !decoded) {
                console.log("Invalid token");
                return res.status(403).json({ message: "Invalid token" });
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


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
