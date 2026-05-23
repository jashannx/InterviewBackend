import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already exists"],
        required: true,
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});
const User = mongoose.model("User", userSchema);
export default User;