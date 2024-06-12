import { initClient } from 'messagebird';
const messagebird = initClient(process.env.MESSAGEBIRD_API_KEY);


class UserMobileOTP {

    //Send OTP to User
    static sendOtpToMobile = async (req, res) => {
        const { phoneNumber } = req.body;
        const newPhoneNumber = "+91" + phoneNumber;

        const params = {
            template: "Your Login OTP is %token",
            timeout: 300,
            tokenLength: 6,
            type: "sms",
            voice: "female"
        };

        messagebird.verify.create(newPhoneNumber, params, (err, response) => {
            if (err) {
                console.log("OTP Send Error:", err);
                res.status(200).send({ "success": false, "status": "failed", "message": "Unable to send the message" })

            }
            //OTP Send Success
            console.log("OTP Send Response:", response);
            res.status(200).send({ "success": true, "status": "success", "message": "Send OTP Successfully", "id": response })

        });
    }

    //Verify OTP 
    static VerifyOtpToMobile = async (req, res) => {
        res.status(200).send({ "success": true, "message": "OTP Verify Successfully" })
    }
}

export default UserMobileOTP;