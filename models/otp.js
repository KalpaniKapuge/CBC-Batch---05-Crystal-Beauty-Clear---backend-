import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Expire OTP documents after 10 minutes (optional, reintroduce after testing)
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;