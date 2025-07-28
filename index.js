import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import  jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';

const app = express();

app.use(bodyParser.json())


app.use((req, res, next) => {
    const tokenString = req.header("Authorization");

    if (tokenString != null) {
        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, "crystal-bloom@28870", (err, decoded) => {
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


app.use('/users',userRouter);

app.use('/products', productRouter);


mongoose.connect("mongodb+srv://admin:admin123@cluster0.djhsp1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
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