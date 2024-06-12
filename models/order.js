import mongoose from "mongoose";

const orderDetail = {
    name: { type: String },
    amount: { type: Number },
    orderId: { type: String },
    razorpay_payment_id: { type: String, default: null },
    razorpay_order_id: { type: String, default: null },
}
//Defining Schema
const orderSchema = new mongoose.Schema(orderDetail, { timestamps: true });

//Model
const orderModel = mongoose.model("orderDetail", orderSchema);

export default orderModel;