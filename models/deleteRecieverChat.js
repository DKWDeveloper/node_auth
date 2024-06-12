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

const recieverChatModel = {
    receiverChatDetail: [{
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

    }]
}
//Defining Schema
const chatSchema = new mongoose.Schema(recieverChatModel, { timestamps: true });

//Model
const deleteRecieverChat = mongoose.model("deleteRecieverChat", chatSchema, "deleteRecieverChat");

export default deleteRecieverChat;