import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';

const app = express();

app.use(bodyParser.json())

app.use('/users',userRouter);


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