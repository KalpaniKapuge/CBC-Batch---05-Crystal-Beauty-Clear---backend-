import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export function createUser(req, res) {
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


export function loginUser(req,res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then(
        (user) => {
            if(user==null){
                res.status(404).json({
                    message: "User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);
                if(isPasswordCorrect){
                    const token = jwt.sign({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        img: user.img
                    },
                    "crystal-bloom@28870"
                )
                    res.status(200).json({
                        message: "Login successful",
                        token: token,
                    });
                }else{
                    res.status(401).json({
                        message: "Invalid password"
                    });
                }
            }
        }
    )
}







//token - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImthbHBhbmlrYXB1Z2UxMDIwQGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IkthbHBhbmkiLCJsYXN0TmFtZSI6IkthcHVnZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzcyNTQzMn0.c72rDURe-UBjJzDFA0_Dm9lffbNYtS3H574JnVNXzu0