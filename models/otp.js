import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

// expire OTP documents after 10 minutes
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
