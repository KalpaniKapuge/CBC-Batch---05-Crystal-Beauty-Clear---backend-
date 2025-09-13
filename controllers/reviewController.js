import Review from "../models/review.js";
import Product from "../models/product.js";
import jwt from "jsonwebtoken";

export async function addReview(req, res) {
  console.log("addReview called with:", {
    params: req.params,
    body: req.body,
    user: req.user,
    token: req.headers.authorization
  });

  // Check if user is authenticated
  if (!req.user || (!req.user._id && !req.user.id)) {
    console.log("Authentication failed: No user or user._id/user.id in request");
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id || req.user.id; // Support both _id and id for robustness

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    console.log("Invalid rating:", rating);
    return res.status(400).json({ message: "Valid rating (1-5) is required" });
  }

  try {
    console.log("Finding product with productId:", productId);
    const product = await Product.findOne({ productId });
    if (!product) {
      console.log("Product not found for productId:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Checking for existing review for user:", userId, "and product:", product._id);
    const existingReview = await Review.findOne({ user: userId, product: product._id });
    if (existingReview) {
      console.log("Existing review found:", existingReview);
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    console.log("Creating new review with:", {
      product: product._id,
      user: userId,
      rating,
      comment
    });
    const newReview = new Review({
      product: product._id,
      user: userId,
      rating,
      comment
    });

    console.log("Saving new review");
    await newReview.save();

    console.log("Fetching all reviews for product:", product._id);
    const reviews = await Review.find({ product: product._id });
    console.log("Updating product averages. Reviews found:", reviews.length);
    product.numReviews = reviews.length;
    product.averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews || 0;

    console.log("Saving product with updated averages:", {
      numReviews: product.numReviews,
      averageRating: product.averageRating
    });
    await product.save();

    console.log("Review added successfully:", newReview);
    return res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (err) {
    console.error("Error in addReview:", err);
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
    console.error("Error in getReviewsByProduct:", err);
    return res.status(500).json({
      message: "Failed to get reviews",
      error: err.message,
    });
  }
}