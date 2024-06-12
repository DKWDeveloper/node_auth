import mongoose from "mongoose";

const personModel = {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    age: { type: Number, required: true, trim: true }
}

//Defining Schema
const userSchema = new mongoose.Schema(personModel);

//collection or model
const person = mongoose.model("userData", userSchema, "userData");

export default person;