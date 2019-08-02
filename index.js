const express = require("express");
const path = require("path");
const app = express();

const http = require("http").Server(app);

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(3000);

const io = require("./socket").init(server);

io.on("connection", socket => {
  console.log("Io connected");
  socket.on("message", data => {
    socket.broadcast.emit("newMessage", data);
  });
  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });
  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("joined", data => {
    socket.broadcast.emit("joined", data);
  });
  socket.on("leaved", data => {
    socket.broadcast.emit("leaved", data);
  });
});
