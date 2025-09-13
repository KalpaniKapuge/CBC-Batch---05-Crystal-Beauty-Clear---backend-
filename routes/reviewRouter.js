import express from 'express';
import { addReview, getReviewsByProduct } from '../controllers/reviewController.js';
import { authMiddleware } from '../controllers/userController.js';

const reviewRouter = express.Router();

reviewRouter.post('/:productId', authMiddleware, addReview);
reviewRouter.get('/products/:productId', getReviewsByProduct);

export default reviewRouter;