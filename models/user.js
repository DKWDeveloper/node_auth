import mongoose from "mongoose";

const userData = {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    isOnline: { type: String, default: '0' },
    terms: { type: Boolean, required: true },
    // isOnline: { type: String, default: '0' },
}
//Defining Schema
const userSchema = new mongoose.Schema(userData);

//Model
const userModel = mongoose.model("userauth", userSchema);

export default userModel;