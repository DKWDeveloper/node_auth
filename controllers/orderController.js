import Order from "../models/order.js";
import Razorpay from "razorpay";



class OrderController {
    static createOrder = async (req, res) => {
        try {
            const { name, amount } = req.body;
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_SECRET_KEY,
            });
            const options = {
                amount: amount,
                currency: 'INR', // Assuming the currency is INR
                receipt: 'order_rcptid_' + Math.floor(Math.random() * 1000),
            };
            const order = await razorpay.orders.create(options);
            console.log(order)
            if (!order) {
                return res.status(400).send({ "message": "Bad Request" })
            }
            const orderModel = new Order({
                name: name,
                amount: amount * 100,
                orderId: order.id
            })
            await orderModel.save();

            // await Order.create({
            //     name: name,
            //     amount: amount,
            //     orderId: order.id
            // })
            order.name = name;
            order.phone = 123456789
            res.json(order)
            // res.send({ "status": "success", "statusCode": 200 })
        } catch (error) {
            console.log('error', error)
            res.status(500).send({ "message": error })
        }
    }

}

export default OrderController;