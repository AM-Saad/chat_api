const express = require("express");
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const Chat = require('./models/Chat');
const User = require('./models/User');
const cors = require('cors')
const bodyParser = require('body-parser');
const cookie = require("cookie");

const multer = require('multer');
const uuidv4 = require('uuid/v4')//for Multer
const path = require("path");
const app = express();

var http = require('http').Server(app);



const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/vue-chat-new`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: 'sessions'
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const match = ["image/png", "image/jpeg", "image/jpg", "image/svg"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `invalid image type. Only accept png/jpeg.`;
      return cb(message, null);
    }

    cb(null, uuidv4())
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
};


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).array("image", 10));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(cors());

const io = require("./socket").init(http);


let activeRooms = []


io.of('/chat').on('connection', function (socket) {
  socket.on('join-chats', async userId => {
    const rooms = Object.keys(socket.rooms);
    let exist = rooms.find(r => r.toString() === userId.toString())
    if (!exist) {
      socket.join(userId)
      activeRooms.push(userId)
      const user = await User.findById(userId)
      if (user) {
        if (user.friends.length > 0) {
          user.friends.forEach(f => {
            socket.broadcast.to(f.id).emit('online-user', { id: userId, online: true });
          })
        }
      }
    }
  })




  socket.on("get-onlines", async userId => {
    const user = await User.findById(userId)
    if (user) {
      if (user.friends.length > 0) {
        user.friends.forEach(f => {
          const isOnline = activeRooms.find(r => r.toString() == f.id.toString())
          if (isOnline) {
            socket.broadcast.to(userId).emit('online-user', { id: f.id, online: true });
          }
        })
      }
    }

  });

  socket.on("offline", async userId => {
    const user = await User.findById(userId)
    if (user) {
      user.online = false
      user.save()
      if (user.friends.length > 0) {
        user.friends.forEach(f => {

          socket.broadcast.to(f.id).emit('online-user', { id: userId, online: false });
        })
      }
    }

  });
  socket.on("message", async data => {
    let newmsg = { chatNumber: data.chatNumber, msg: data.msg, date: data.date, usertype: data.type, sender: data.sender, receiver: data.receiver }
    await Chat.findOneAndUpdate({ chatNumber: data.chatNumber }, { $push: { conversation: newmsg } })
    socket.broadcast.to(data.receiver).emit('new-message', newmsg);

  });

  socket.on("typing", (chatNumber, receiver) => {
    socket.broadcast.to(receiver).emit('typing', chatNumber);

  });
  socket.on("stoptyping", (chatNumber, receiver) => {
    socket.broadcast.to(receiver).emit('stoptyping', chatNumber);
  });



  


  socket.on("new_friend_request", (receiver, user) => {
    socket.broadcast.to(receiver).emit('new_friend_request', user);
  });

  socket.on("friend_request_accept/deny", (data) => {
    socket.broadcast.to(data.receiver).emit('friend_request_status', { friend: data.user, action: data.action });
  });
  socket.on("friend_block_unblock", (data) => {
    console.log(data);
    socket.broadcast.to(data.receiver).emit('friend_block_unblock', { active: data.active, blocker:data.blocker,chatNumber:data.chatNumber });
  });
  socket.on("clear_chat", (data) => {
    console.log(data);
    socket.broadcast.to(data.receiver).emit('clear_chat', { chatNumber:data.chatNumber });
  });
  

  socket.on('disconnect', () => {
  
  });
  socket.on('disconnecting', (data) => {
    console.log('disconnecting');
    const rooms = Object.keys(socket.rooms);
  });
})

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { requests, friends } = require("./controllers/user");
app.use('/auth', authRoutes);
app.use('/user', userRoutes);




mongoose
  .connect(MONGODBURI)
  .then(result => {
    console.log(`Working On Port ${4000}`);
  })
  .catch(err => {
    console.log(`error is ${err}`);
  });
let port = process.env.PORT || 4000

http.listen(port, function () {
  console.log('listening on *:80');
});
