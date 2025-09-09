import Review from "../models/review.js";
import Product from "../models/product.js";

export async function addReview(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Valid rating (1-5) is required" });
  }

  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: product._id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const newReview = new Review({
      product: product._id,
      user: req.user._id,
      rating,
      comment
    });

    await newReview.save();

    // Update product averages
    const reviews = await Review.find({ product: product._id });
    product.numReviews = reviews.length;
    product.averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews || 0;
    await product.save();

    return res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to add review",
      error: err.message,
    });
  }
}

export async function getReviewsByProduct(req, res) {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'firstName lastName image')
      .sort('-createdAt');

    return res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to get reviews",
      error: err.message,
    });
  }
}