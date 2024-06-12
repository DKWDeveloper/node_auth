import mongoose from "mongoose";


const otpData = {
    email: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    expireIn: { type: Number, required: true, trim: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 900 } }
}

//Defing Schema 
const otpSchema = new mongoose.Schema(otpData, { timestamps: true });

//Model
const Otp = mongoose.model("Otp", otpSchema, "Otp");

export default Otp;