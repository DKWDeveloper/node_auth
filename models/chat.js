import mongoose from "mongoose";

const chatModel = {
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userauth'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userauth'
    },
    message: {
        type: String,
        required: true
    },
    deletedForSender: {
        type: Boolean,
        default: false
    },
}
//Defining Schema
const chatSchema = new mongoose.Schema(chatModel, { timestamps: true });

//Model
const userChatModel = mongoose.model("Chat", chatSchema);

export default userChatModel;