import mongoose from "mongoose";

const sessionObj = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}

//Defing Schema 
const sessionSchema = new mongoose.Schema(sessionObj, { timestamps: true });

//Model
const Session = mongoose.model("Session", sessionSchema);

export default Session;