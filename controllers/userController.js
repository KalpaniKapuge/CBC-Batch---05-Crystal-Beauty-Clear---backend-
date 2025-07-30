import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function createUser(req, res) {
    if (req.user != null) {
        if (req.user.role !== "admin") {
            res.status(403).json({
                message: "You are not authorized to create admin accounts"
            });
            return;
        } else {
            if (req.body.role !== "admin") {
                res.status(403).json({
                    message: "You can only create admin accounts"
                });
                return;
            }
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    });

    user.save()
        .then(savedUser => {
            res.status(201).json({
                message: "User created successfully",
                user: savedUser
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Error saving user",
                error: err
            });
        });
}

export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then(
        (user) => {
            if (user == null) {
                return res.status(404).json({
                    message: "User not found"
                });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);
                if (isPasswordCorrect) {
                    const token = jwt.sign(
                    {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        img: user.img,
                    },
                    process.env.JWT_KEY 
                    );

                    return res.status(200).json({
                        message: "Login successful",
                        token: token,
                        role: user.role,
                    });
                } else {
                    return res.status(401).json({
                        message: "Invalid password"
                    });
                }
            }
        }
    ).catch(err => {
        res.status(500).json({
            message: "Error logging in",
            error: err
        });
    });
}

export function isAdmin(req) {
    if (req.user == null) {
        return false;
    }
   
    return req.user.role === "admin";
}
