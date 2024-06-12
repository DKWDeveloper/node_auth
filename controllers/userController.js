import UserModel from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import Otp from "../models/otp.js";
import schedule from "node-schedule";
import validator from "validator";

class UserController {

    //Registration Controller.
    static userRegistration = async (req, res) => {
        const { name, email, password, confirmPassword, terms } = req.body;
        const userEmail = await UserModel.findOne({ email: email });
        const superUser = await UserModel.distinct('email');
        if (userEmail) {
            res.send({ "status": "failed", "errorMessage": "EMAIL_EXISTS", "message": "Email already exists", "statusCode": 409 })
        } else {
            if (name && email && password && confirmPassword && terms) {
                if (validator.isEmail(email)) {
                    if (password === confirmPassword) {
                        try {
                            const saltRounds = await bcrypt.genSalt(10);
                            const hashPassword = await bcrypt.hash(password, saltRounds);
                            const userPasswords = new UserModel({
                                name: name,
                                email: email,
                                password: hashPassword,
                                terms: terms
                            })
                            await userPasswords.save();
                            //generate JWT token
                            const saved_UserData = await UserModel.findOne({ email: email });
                            const token = jwt.sign({ userId: saved_UserData._id, name: saved_UserData.name, email: saved_UserData.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                            res.status(201).send({ "success": true, "status": "Success", "message": "Successfully resgister", "expires": "7200", "statusCode": 201, "userId": saved_UserData.name, "email": saved_UserData.email, "token": token });
                        } catch (error) {
                            console.log('user error')
                            res.send({ "success": false, "status": "failed", "message": "Unable to Register" })
                        }
                    } else {
                        res.send({ "success": false, "status": "failed", "message": "Password and confirm password doesn't match" })
                    }
                } else {
                    res.status(201).json({ "success": false, "status": "failed", "message": "Email is not valid" })
                    // res.status(400).json({ message: 'Email is not valid' });
                }
            } else {
                res.send({ "success": false, "errorMessage": "ALL_FIELD_REQUIRED", "status": "failed", "message": "All fields are required" })
            }
        }
    }

    //Login Controller.
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const userData = await UserModel.findOne({ email: email });
                if (userData != null) {
                    const isPasswordMatch = await bcrypt.compare(password, userData.password);
                    if ((userData.email === email) && isPasswordMatch) {
                        //Generate JWT Token.
                        const token = jwt.sign({ userId: userData._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                        res.send({ "success": true, "status": "Success", "message": "user Login Successfully", "userId": userData._id, "token": token, "email": email, "name": userData.name, "expires": "7200" });
                    } else {
                        res.status(201).send({ "success": false, "status": "failed", "message": "Password or Email is invalid" })
                    }
                } else {
                    res.status(201).send({ "success": false, "status": "failed", "message": "Email or Password is invalid" })
                }
            } else {
                res.status(201).send({ "success": false, "status": "failed", "errorMessage": "ALL_FIELD_REQUIRED" ,"message": "All fields required" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ "success": false, "status": "failed", "message": "Unable to login" })
        }
    }
    //Change user password.
    static changeUserPassword = async (req, res) => {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user._id;
        const user = await UserModel.findById(userId)
        if (currentPassword && newPassword && confirmNewPassword) {
            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (isPasswordMatch) {
                if (newPassword !== confirmNewPassword) {
                    res.send({ "status": "failed", "message": "new password and confirm new password doesn't match" });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(newPassword, salt);
                    const isNewPassword = await bcrypt.compare(newPassword, user.password);
                    if (isNewPassword) {
                        res.send({ "status": false, "message": "your new password should be different from current password" });
                    } else {
                        await UserModel.findByIdAndUpdate(userId, {
                            $set: { password: newHashPassword }
                        })
                        res.send({ "status": "Success", "message": "change Password Successfully" });
                    }
                }
            } else {
                res.send({ "status": "failed", "message": "old password is not found" });
            }
        } else {
            res.send({ "status": "failed", "message": "All fields are required" });
        }
    }

    //Send Link email For reset password
    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await UserModel.findOne({ email: email });
            if (user) {
                const secretKey = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '15m' });
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                //Send Email
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "My first password reset Link handle by self",
                    text: "Hello Node mailer",
                    html: `<a href=${link}>Click Here</a> to Reset Your Password`
                })
                res.send({ "status": "success", "message": "Password Reset Link is send in your Email.please check your Email", "info": info })
                // This is handle by frontend :- /api/user/reset/:id/:token
            } else {
                res.send({ "status": "failed", "message": "Email doesn't exists" })
            }
        } else {
            res.send({ "status": "failed", "message": "Email field is required" })
        }
    }

    //Forgot Password
    static forgotPassword = async (req, res) => {
        const { password, confirmPassword } = req.body;
        const { id } = req.params;
        const { token } = req.query;
        const user = await UserModel.findById(id);
        const newSecretKey = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, newSecretKey)
            if (password && confirmPassword) {
                if (password !== confirmPassword) {
                    res.send({ "status": "failed", "message": "Password and confirm Password not match" });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(password, salt);
                    await UserModel.findByIdAndUpdate(user._id, {
                        $set: { password: newHashPassword }
                    })
                    res.send({ "success": true, "status": "success", "message": "Reset Password Successfully" });
                }
            } else {
                res.send({ "status": "failed", "message": "All field are required" });
            }
        } catch (error) { }
    }


    //Get logged user data.
    static getLoggedUserData = async (req, res) => {
        res.send({ "user": req.user });
    }

    //practice my self.
    static myLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const userDataBase = await UserModel.findOne({ email: email });
                if (userDataBase) {
                    const isMatch = await bcrypt.compare(password, userDataBase.password);
                    if (userDataBase.email === 'jk@gmail.com') {
                        res.send({ "message": "super admin" })
                    } else {
                        if ((userDataBase.email === email) && isMatch) {
                            res.send({ "status": "success", "message": "Login successfully" });
                        } else {
                            res.send({ "status": "failed", "message": "Password is invalid" });
                        }
                    }
                } else {
                    res.send({ "status": "failed", "message": "your credential wrong" });
                }
            } else {
                res.send({ "status": "failed", "message": "required all field" });
            }
        } catch (error) {
            res.send({ "status": "error", "message": "Internal Server Error", "status_code": 500 })
        }
    }

    //Send Email
    static sendNodeMailer = async (otp, user) => {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "One Time Password Verification",
            text: "Hello Node mailer",
            html: `<span style="font-size: 20px">${otp}</span> This is OTP is valid only for 15 minutes`
        })
    }

    // static deletionJob = schedule.scheduleJob('*/1 * * * *', async () => {
    //     try {
    //         const currentTime = new Date();
    //         await Otp.deleteMany({ expireIn: { $lte: currentTime } });
    //         console.log('Expired OTPs deleted successfully.');
    //     } catch (error) {
    //         console.error('Error deleting expired OTPs:', error);
    //     }
    // });

    /**
     * This function is used to send email.
     */
    static sendOtpEmail = async (req, res) => {
        const { email } = req.body;
        const reponseType = {};
        if (email) {
            if (validator.isEmail(email)) {
                const user = await UserModel.findOne({ email: email });
                if (user) {
                    const secretKey = user._id + process.env.JWT_SECRET_KEY;
                    const token = jwt.sign({ userId: user._id }, secretKey);
                    const min = 1000;
                    const max = 9999;
                    let existingOTPs = new Set();
                    //create unique key
                    function generateUniqueOTP() {
                        let otp;
                        do {
                            otp = Math.floor(Math.random() * (max - min + 1)) + min;
                        } while (existingOTPs.has(otp));

                        existingOTPs.add(otp);
                        return otp;
                    }
                    // Example usage:
                    const uniqueOTP = generateUniqueOTP();
                    const otpData = new Otp({
                        email: user.email,
                        code: uniqueOTP,
                        expireIn: new Date().getTime() + 15 * 60 * 1000,
                    })
                    const otpResponse = await otpData.save();
                    this.sendNodeMailer(uniqueOTP, user);
                    reponseType.statusText = "Success";
                    reponseType.message = "Please check Your Email";
                    reponseType.data = { userId: user._id, email: user.email, token: token };
                    res.status(201).json(reponseType);
                } else {
                    res.send({ "status": "failed", "message": "Email doesn't Exists" });
                }
            } else {
                function isMobileNumber(email) {
                    const mobileRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
                    return mobileRegex.test(email);
                }

                if (isMobileNumber(email)) {
                    console.log('It is a mobile number.');
                } else {
                    console.log('It is not a mobile number.');
                }
                // res.status(201).send({ "status": "failed", "message": "Enter Valid Email" });
                res.status(201).send({ "status": "failed", "message": "You enter a mobile number" });
            }

        } else {
            res.send({ "status": "failed", "message": "Email field is required" });
        }
    }

    /**
     * This function is used to reset password via otp.
     */
    static OtpVerify = async (req, res) => {
        const { otp } = req.body;
        const responseType = {};
        // this.deletionJob();
        try {
            if (otp) {
                const otpData = await Otp.findOne({ code: otp });
                if (!otpData || otpData === null) {
                    res.send({ "status": "Otp doesn't Exists" });
                }
                else {
                    const currentTime = new Date();
                    const differenceTime = otpData.expireIn - currentTime;
                    if (differenceTime < 0 || differenceTime === 0) {
                        const currentTime = new Date();
                        await Otp.deleteMany({ expireIn: { $lte: currentTime } });
                        responseType.status = "error";
                        responseType.message = "Invalid OTP";
                        responseType.status_code = 402;
                        res.status(402).json(responseType);
                    } else {
                        const user = await UserModel.findOne({ email: otpData.email });
                        const secretKey = user._id + process.env.JWT_SECRET_KEY;
                        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '15m' });
                        res.send({ "success": true, "message": "otp recieved succesfully", "user": { email: user.email, id: user._id, token: token } });
                    }
                }
            } else {
                responseType.status = "error";
                responseType.message = "OTP is required";
                responseType.status_code = 402;
                res.status(400).json(responseType);
            }

        } catch (error) {
            responseType.status = "error";
            responseType.message = "Internal Server Error";
            responseType.status_code = 500;
            res.status(500).json(responseType);
        }
    }
}

export default UserController;