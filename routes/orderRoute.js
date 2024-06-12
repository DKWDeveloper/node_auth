import express from "express";
import checkUserAuthMiddleware from "../middlewares/authMiddleware.js";
import MethodNotAllowed from "../middlewares/methodNotAllow.js";
import OrderController from "../controllers/orderController.js";

const orderRouter = express.Router();

//Route Level Middleware - To Protect Route
// orderRouter.use('/createOrder', checkUserAuthMiddleware);


//Protected Route
orderRouter.post('/createOrder', OrderController.createOrder);

export default orderRouter;