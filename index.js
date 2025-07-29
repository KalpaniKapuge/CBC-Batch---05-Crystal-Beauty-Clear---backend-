import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import  jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';
import cors from 'cors';

const app = express();

app.use(cors())

app.use(bodyParser.json())


app.use((req, res, next) => {
    const tokenString = req.header("Authorization");

    if (tokenString != null) {
        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, "process.env.JWT_KEY", (err, decoded) => {
            if (err || !decoded) {
                console.log("Invalid token");
                return res.status(403).json({
                    message: "Invalid token"
                });
            }
            
            console.log(decoded);
            req.user = decoded;
            next();
        });
    } else {
        
        next();
    }
});


app.use('/api/users',userRouter);

app.use('/api/products', productRouter);

app.use('/api/orders',orderRouter);


mongoose.connect("process.env.MONGODB_URL").then(
    () => {
        console.log("Connected to MongoDB");
    }
).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});




app.listen(5000,
    () => {
        console.log("Server is running on port 5000");
    }
)