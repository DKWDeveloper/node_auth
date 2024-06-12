import express from "express";
import checkUserAuthMiddleware from "../middlewares/authMiddleware.js";
import MethodNotAllowed from "../middlewares/methodNotAllow.js";
import UserChatController from "../controllers/userChatController.js";

const chatRouter = express.Router();


//Route Level Middleware - To Protect Route
chatRouter.use('/getUserRegisterList', checkUserAuthMiddleware);
chatRouter.use('/saveUserChat', checkUserAuthMiddleware);
chatRouter.use('/getDeleteUserSideList', checkUserAuthMiddleware);
chatRouter.use('/deleteChatUserSide', checkUserAuthMiddleware);
chatRouter.use('/deleteRecieverChat', checkUserAuthMiddleware);
chatRouter.use('/getDeleteRecieveChat', checkUserAuthMiddleware);
chatRouter.use('/getDeleteEveryOneChat/:id', checkUserAuthMiddleware);
chatRouter.use('/getChatList', checkUserAuthMiddleware);


//Protected Route
chatRouter.get('/getUserRegisterList', UserChatController.getUserRegister);
chatRouter.post('/saveUserChat', UserChatController.saveUserChatInDataBase);
chatRouter.put('/deleteChat', UserChatController.deleteChat);
chatRouter.post('/deleteChatUserSide', UserChatController.deleteUserSideChat);
chatRouter.get('/getDeleteUserSideList', UserChatController.getDeleteUserChatList);
chatRouter.post('/deleteRecieverChat', UserChatController.deleteReceiverChat);
chatRouter.get('/getDeleteRecieveChat', UserChatController.getDeleteRecieveChat);
chatRouter.delete('/getDeleteEveryOneChat/:id', UserChatController.getDeleteEveryOneChat);
chatRouter.get('/getChatList', UserChatController.getChatList);


// Handling other methods for deleteUserSideChat route
chatRouter.all('/deleteChatUserSide', MethodNotAllowed);
chatRouter.all('/getDeleteUserSideList', MethodNotAllowed);
chatRouter.all('/deleteRecieverChat', MethodNotAllowed);
chatRouter.all('/getDeleteRecieveChat', MethodNotAllowed);
chatRouter.all('/getDeleteEveryOneChat/:id', MethodNotAllowed);
chatRouter.get('/getChatList', MethodNotAllowed);




export default chatRouter;