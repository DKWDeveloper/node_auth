import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, //true for 465, false for other ports
    auth: {
        user: 'dk6589010@gmail.com', //Admin Gmail ID
        pass: 'aytt zbsy umfp fota' //Admin Gmail Password
    }
})

export default transporter;