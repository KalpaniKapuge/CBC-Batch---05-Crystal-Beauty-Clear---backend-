import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "customer",
  },
  image: {
    type: String,
    required: false,
    default: "https://www.shutterstock.com/image-vector/profile-user-icons-set-avatar-260nw-2585261745.jpg"
  },
  isBlocked: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
