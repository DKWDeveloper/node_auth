import express from "express";
import UserController from "../controllers/userController.js";
import checkUserAuthMiddleware from "../middlewares/authMiddleware.js";
import UserMobileOTP from "../controllers/mobileOTPverification.js";
import UserData from "../controllers/userDataController.js";
import multer from "multer";
import sessionLogoutMiddleware from "../middlewares/sessionLogoutMiddleware.js";
import checkSession from "../middlewares/multipleLoginMiddleware.js";


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            return cb(null, "./uploads/pdf");
        } else {
            return cb(null, "./uploads/images");
        }
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

//Route Level Middleware - To Protect Route
router.use('/changePassword', checkUserAuthMiddleware);
router.use('/getLoggedUserData', checkUserAuthMiddleware);
router.use('/createUserData', checkUserAuthMiddleware);
router.use('/getUserData', checkUserAuthMiddleware);
router.use('/deleteUserData/:id', checkUserAuthMiddleware);
router.use('/updateUserById/:id', checkUserAuthMiddleware);
router.use('/updateUserByBodyId', checkUserAuthMiddleware);
router.use('/deleteById', checkUserAuthMiddleware);
router.use('/deleteUserData/:id', checkUserAuthMiddleware);
// router.use('/login', checkSession)

//Public Routes
router.post('/registration', UserController.userRegistration);
router.post('/login',checkSession, UserController.userLogin);
router.post('/myLogin', UserController.myLogin);
router.post('/sendLinkEmail', UserController.sendUserPasswordResetEmail);
router.post('/forgotPassword/userId/:id/token', UserController.forgotPassword);
router.post('/mobileLogin', UserMobileOTP.sendOtpToMobile)

router.post('/sendOtpEmail', UserController.sendOtpEmail);
router.post('/otp', UserController.OtpVerify);


//Protected Routes
router.post('/changePassword', UserController.changeUserPassword);
router.get('/getLoggedUserData', UserController.getLoggedUserData);

router.post('/createUserData', upload.single('image'), UserData.postUserData);
router.put('/updateUserById/:id', upload.single('image'), UserData.updateUserById);
router.put('/updateUserByBodyId', upload.single('image'), UserData.updateUserByBodyId);

router.get('/getUserData', UserData.getUserData);
router.delete('/deleteUserData/:id', UserData.deleteUserData);
router.put('/deleteById', UserData.deleteById);

export default router;