import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';
import connectDB from './db/connectdb.js';
import userRoute from './routes/userAuthRoute.js';
import chatRouter from './routes/useChatRoute.js';
import orderRouter from './routes/orderRoute.js';
import UserModel from "./models/user.js";
import Chat from './models/chat.js';

//Socket imports
import http from 'http'
import { Server } from "socket.io";
import sessionLogoutMiddleware from './middlewares/sessionLogoutMiddleware.js';
import multipleUserLoginMiddleware from './middlewares/multipleLoginMiddleware.js';
import session from 'express-session';


const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
// const DATABASE_URL = process.env.DATABASE_CLUSTER_URL;


//CORS Policy
app.use(cors());



//Database connection
connectDB(DATABASE_URL);

//handle file upload
// app.use(express.urlencoded({extended:false}))

//JSON
app.use(express.json());


//Multiple same user login Prevent middileware.
// app.use(multipleUserLoginMiddleware)

// Use the middleware
// app.use(sessionLogoutMiddleware);

// Middleware setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

//This middleware show internal server error.
app.use((err, req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Errors ccvc' });
  }
  // console.log(req.body)
  // console.error('Error 500', err.stack);
  // res.status(500).json({ error: 'Internal Server Errors ccvc' });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Error Handle Custom route to handle requests to /uploads/* when static file serving is disabled
app.use('/uploads/*', (req, res) => {
  res.status(404).send('File not found. Static file serving is currently disabled.');
});

// Use the middleware
// app.use(sessionLogoutMiddleware);


//Load Routes
app.use('/api/user', userRoute);
app.use('/api/user', chatRouter);
app.use('/api/user', orderRouter)

//Socket var.
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


const userChatNamespace = io.of('/userChat-namespace');

userChatNamespace.on('connection', async (socket) => {
  const loginUserId = socket.handshake.query.userId;
  try {
    if (loginUserId) {
      // Update user as online
      const updatedUser = await UserModel.findByIdAndUpdate(loginUserId, { $set: { isOnline: '1' } }, { new: true }).select('-password');

      // Broadcast online status for all users
      socket.broadcast.emit('getOnlineStatus', { userId: loginUserId, user: updatedUser });
    }
    // Listen for user disconnection
    socket.on('disconnect', async () => {
      if (loginUserId && loginUserId !== 'undefined') {
        // Update user as offline
        const updatedUser = await UserModel.findByIdAndUpdate(loginUserId, { $set: { isOnline: '0' } }, { new: true });
        // Broadcast offline status for all users
        socket.broadcast.emit('getOnlineStatus', { userId: loginUserId, user: updatedUser });
      }
    });

    //Chat Implementation
    socket.on('newChat', (data) => {
      socket.join(loginUserId);
      socket.broadcast.emit('loadNewChat', data)
      // userChatNamespace.to(data.receiverId).emit('loadNewChat', data)
      // socket.broadcast.emit('loadNewChat', data);
    })

    //Load old chats.
    socket.on('getChat', async (data) => {
      const findQuery = {
        $or: [
          { senderId: data.senderId, receiverId: data.recevierId },
          { senderId: data.recevierId, receiverId: data.senderId },
        ]
      }
      const chatList = await Chat.find(findQuery)
      socket.emit('loadOldChat', { chats: chatList, success: true });
    })

    socket.on('editChat', async (data) => {
      try {
        await Chat.findByIdAndUpdate({ _id: data.messageId }, {
          $set: {
            message: data.chat
          }
        })
        console.log(data)
        socket.broadcast.emit('editMessage', data);
      } catch (error) {
        console.log(error)
      }
    })

    //delete Chat.
    socket.on('deleteChat', async (data) => {
      const chatList = await Chat.find()
      socket.broadcast.emit('deleteChatId', data);
    })
  } catch (error) {
    console.error('Error handling connection:', error);
  }
});

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`)
// });

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});