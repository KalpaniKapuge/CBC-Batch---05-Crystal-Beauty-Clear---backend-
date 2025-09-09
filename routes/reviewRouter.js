import express from 'express';
import { addReview, getReviewsByProduct } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/:productId', addReview);
reviewRouter.get('/products/:productId', getReviewsByProduct);

export default reviewRouter;