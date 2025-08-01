import mongoose from "mongoose";

const productSubSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  altNames: [
    { type: String }
  ],
  description: {
    type: String,
    required: true,
  },
  images: [
    { type: String }
  ],
  labelledPrice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled', 'returned'],
    default: "pending",
    required: true
  },
  labelledTotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  products: [productSubSchema],
  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
