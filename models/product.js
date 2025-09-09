import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  altNames: [
    { type: String }
  ],
  description: {
    type: String,
    required: false
  },
  images: [
    { type: String }
  ],
  labelledPrice: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
