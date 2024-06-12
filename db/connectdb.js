import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        const dbOptions = {
            dbName: process.env.DB_NAME
        }
        await mongoose.connect(DATABASE_URL, dbOptions)
        console.log('connected successfully...');
    } catch (error) {
        console.log('mongo connection error');
    }
}

export default connectDB;