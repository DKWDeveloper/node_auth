import Chat from "../models/chat.js";
import DeleteChatUserSide from "../models/chatDeleteForMe.js";
import DeleteRecieverChat from "../models/deleteRecieverChat.js";
import DeleteRecieveChat from "../models/deleteRecieverSide.js";
import userModel from "../models/user.js";


class UserChatController {
    /**
     * Handles the GET request for retrieving user registration data. 
     * @param {*} req 
     * @param {*} res 
     */
    static getUserRegister = async (req, res) => {
        const userId = req.user._id;
        try {
            if (userId) {
                const userList = await userModel.find({ _id: { $nin: userId } }).select('-password')
                res.status(200).send({ "status": "success", "userList": userList, "statusCode": 200 });
            } else {
                res.status(400).send({ "status": "failed", "message": "Provide User Id", "statusCode": 400 })
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": error, "statusCode": 500 })
        }
    }

    /**
     * Post the data.
     * @param {*} req 
     * @param {*} res 
     */
    static saveUserChatInDataBase = async (req, res) => {
        const { senderId, receiverId, message } = req.body;
        try {
            if (senderId && receiverId && message) {

                const chat = new Chat({
                    senderId: senderId,
                    receiverId: receiverId,
                    message: message
                });
                const chatData = await chat.save();
                res.status(200).send({ success: true, "status": "success", "message": "chat Successfully created", "statusCode": 200, data: chatData });
            } else {
                res.status(400).send({ success: false, status: "Error", "message": "message not sent" })
            }

        } catch (err) {
            res.status(400).send({ success: false, message: err })
        }
    }

    static deleteChat = async (req, res) => {
        const { id } = req.body;
        try {
            await Chat.deleteOne({ _id: id });
            res.status(200).send({ success: true });
        }
        catch (err) {
            res.status(400).send({ success: false, message: err.message })
        }
    }

    /**
     * Function is used to hide user side chat.
     * @param {*} req 
     * @param {*} res 
     */
    static deleteUserSideChat = async (req, res) => {
        const { _id, senderId, receiverId, message, deletedForSender } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).send({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user._id;
        try {
            if (senderId && receiverId && message) {
                if (userId == senderId) {
                    const deleteChatUserSide = new DeleteChatUserSide({
                        _id: _id,
                        senderId: senderId,
                        receiverId: receiverId,
                        message: message,
                        deletedForSender: deletedForSender,
                    });
                    const chatData = await deleteChatUserSide.save();
                    res.status(200).send({ success: true, "status": "success", "message": "chat deleted Successfully", "statusCode": 200, });
                } else {
                    const deleteRecieveChat = new DeleteRecieveChat({
                        _id: _id,
                        senderId: senderId,
                        receiverId: receiverId,
                        message: message,
                        deletedForSender: deletedForSender,
                    });
                    await deleteRecieveChat.save();
                    res.status(200).send({ success: true, "status": "success", "message": "recievr chat", "statusCode": 200 })
                }

            } else {
                res.status(400).send({ success: false, status: "Error", "message": "message not sent" })
            }

        } catch (err) {
            res.status(400).send({ success: false, message: 'intenal Server error' })
        }
    }

    /**
     * Function is used to get user list.
     * @param {*} req 
     * @param {*} res 
     */
    static getDeleteUserChatList = async (req, res) => {
        try {
            const userId = req.user._id;
            const deleteUserChatList = await DeleteChatUserSide.find({ senderId: userId });
            // const getDeletedReciverSide = await DeleteRecieveChat.find();
            // const combineArray = [...deleteUserChatList, ...getDeletedReciverSide]
            res.status(200).send({ success: true, status: "success", message: "get Successfully", userOwnchatList: deleteUserChatList, statusCode: 200 });
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(500).send({ success: false, message: 'Internal Server Error' }); // Send 500 status for internal server error
        }
    }

    /**
     * Function is used to get user list.
     * @param {*} req 
     * @param {*} res 
     */
    static getDeleteRecieveChat = async (req, res) => {
        try {
            const getDeletedReciverSide = await DeleteRecieveChat.find();
            res.status(200).send({ success: true, status: "success", message: "get Successfully", getRecieveChat: getDeletedReciverSide, statusCode: 200 });
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(500).send({ success: false, message: 'Internal Server Error' }); // Send 500 status for internal server error
        }
    }


    /**
     * Function is used to delete chat.
     * @param {*} req 
     * @param {*} res 
     */
    static getDeleteEveryOneChat = async (req, res) => {
        const { id } = req.params;
        try {
            const user = await Chat.findById(id);
            if (user) {
                await Chat.findByIdAndDelete(id);
                res.status(201).send({ "status": "success", "message": "Delete Successfully", "statusCode": 201 });
            } else {
                res.status(201).send({ "status": "failed", "message": "id not found", "statusCode": 201 });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "internal Server Error" });
        }
    }

    static getChatList = async (req, res) => {
        try {
            const chats = await Chat.find();
            if (chats) {
                res.status(201).send({ "status": "success", "message": "Chat List", chats: chats, "statusCode": 201 });
            } else {
                res.status(201).send({ "status": "failed", "message": "error", "statusCode": 201 });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "internal Server Error" });
        }
    }


    /**
      * Function is used to hide user side chat.
      * @param {*} req 
      * @param {*} res 
      */
    static deleteReceiverChat = async (req, res) => {
        const { receiverChatDetail } = req.body;
        try {
            if (receiverChatDetail.length > 0) {
                const deleteReceiverChat = new DeleteRecieverChat({
                    receiverChatDetail: receiverChatDetail
                });
                await deleteReceiverChat.save();
                const finder = DeleteRecieverChat.find()
                DeleteRecieverChat.find()
                    .exec()
                    .then(docs => {
                        // Handle retrieved documents here
                    })
                    .catch(err => {
                        // Handle errors
                        console.error("Error occurred while fetching data:", err);
                    });
                res.status(200).send({ success: true, status: "success", message: "Reciever Chat deleted successfully", statusCode: 200 });
            } else {
                res.status(400).send({ success: false, status: "Error", message: "Data is Required" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, status: "Error", message: "Internal Server Error", error: err.message });
        }
    }




}

export default UserChatController;