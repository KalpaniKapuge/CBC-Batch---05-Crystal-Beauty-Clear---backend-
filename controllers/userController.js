// controllers/userController.js
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();

const signToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      image: user.image,
      _id: user._id,
    },
    process.env.JWT_KEY,
    { expiresIn: "7d" }
  );
};

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export async function sendOTP(req, res) {
  try {
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await OTP.deleteMany({ email });

    const otpEntry = new OTP({
      email,
      otp: randomOTP,
    });
    await otpEntry.save();

    const message = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resetting password for Crystal Beauty Clear",
      text: `This is your password reset OTP: ${randomOTP}`,
      html: `<p>This is your password reset OTP:</p><h2>${randomOTP}</h2>`,
    };

    transport.sendMail(message, (error) => {
      if (error) {
        console.error("OTP email error:", error);
        return res.status(500).json({
          message: "Failed to send OTP",
          error: error.message || error,
        });
      } else {
        return res.json({
          message: "OTP sent successfully",
        });
      }
    });
  } catch (err) {
    console.error("sendOTP error:", err);
    return res.status(500).json({
      message: "Failed to process OTP request",
      error: err.message || err,
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { otp, email, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    const storedOtp = await OTP.findOne({ email });
    if (!storedOtp) {
      return res.status(404).json({
        message: "No OTP request found. Please request a new one.",
      });
    }

    if (String(otp) !== String(storedOtp.otp)) {
      return res.status(403).json({
        message: "OTPs are not matching!",
      });
    }

    await OTP.deleteMany({ email });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    return res.json({
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({
      message: "Failed to reset password",
      error: err.message || err,
    });
  }
}

export async function createUser(req, res) {
  try {
    if (req.user != null && req.body.role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to create admin accounts",
      });
    }

    const { firstName, lastName, email, password, role, image } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "customer",
      image: image || undefined,
    });

    const savedUser = await user.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        image: savedUser.image,
        _id: savedUser._id,
      },
    });
  } catch (err) {
    console.error("createUser error:", err);
    const response = {
      message: "Error saving user",
      error: err.message || err,
    };
    if (err.code === 11000) {
      response.message = "Email already in use";
    }
    return res.status(500).json(response);
  }
}

export function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = signToken(user);
      return res.status(200).json({
        message: "Login successful",
        token,
        role: user.role,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Error logging in",
        error: err.message || err,
      });
    });
}

export async function loginWithGoogle(req, res) {
  try {
    const accessToken = req.body.accessToken;
    if (!accessToken) {
      return res.status(400).json({
        message: "Access token is required",
      });
    }

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const googleUser = response.data;
    if (!googleUser.email) {
      return res.status(400).json({
        message: "Failed to retrieve email from Google",
      });
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = new User({
        email: googleUser.email,
        firstName: googleUser.given_name || "",
        lastName: googleUser.family_name || "",
        password: bcrypt.hashSync("googleUserPlaceholder", 10),
        image: googleUser.picture,
        role: "customer",
      });
      await user.save();
    }

    const token = signToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({
      message: "Error during Google login",
      error: err.response?.data || err.message || err,
    });
  }
}

export function isAdmin(req) {
  if (!req.user) return false;
  return req.user.role === "admin";
}

export function getUser(req, res) {
  if (!req.user) {
    return res.status(403).json({
      message: "You are not authorized to view user details",
    });
  }
  const { password, ...safe } = req.user;
  return res.json(safe);
}

export const authMiddleware = (req, res, next) => {
  console.log("authMiddleware called with headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log("authMiddleware failed: No Bearer token provided");
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("authMiddleware decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};