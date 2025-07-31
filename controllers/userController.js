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
      img: user.img,
    },
    process.env.JWT_KEY
  ); 
};


const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "kalpanikapuge1020@gmail.com",
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

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // delete all previous OTPs for this email
    await OTP.deleteMany({ email: email });

    // save new OTP
    const otpEntry = new OTP({
      email: email,
      otp: randomOTP,
      createdAt: new Date(),
    });
    await otpEntry.save();

    const message = {
      from: "kalpanikapuge1020@gmail.com",
      to: email,
      subject: "Resetting password for Crystal Beauty Clear",
      text: `This is your password reset OTP: ${randomOTP}`,
      html: `<p>This is your password reset OTP:</p><h2>${randomOTP}</h2>`,
    };

    transport.sendMail(message, (error, info) => {
      if (error) {
        console.error("OTP email error:", error);
        return res.status(500).json({
          message: "Failed to send OTP",
          error: error.message || error,
        });
      } else {
        return res.json({
          message: "OTP sent successfully",
          // do not send OTP in production; included here if needed for dev
          otp: randomOTP,
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

export async function createUser(req, res) {
  try {
    // If creating admin, ensure requester is admin
    if (req.user != null && req.body.role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to create admin accounts",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "user",
      img: req.body.img || null,
    });

    const savedUser = await user.save();
    return res.status(201).json({
      message: "User created successfully",
      user: {
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        img: savedUser.img,
        id: savedUser._id,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error saving user",
      error: err.message || err,
    });
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
        return res.status(404).json({
          message: "User not found",
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          message: "Invalid password",
        });
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

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
        img: googleUser.picture,
        role: "user",
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
