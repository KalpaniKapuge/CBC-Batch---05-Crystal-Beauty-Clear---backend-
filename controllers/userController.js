import bcrypt from 'bcrypt';
import User from '../models/user.js';

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
