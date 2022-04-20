let io;

module.exports = {
  init: httpServer => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "http://192.168.1.6:3000",
        credentials: true
      }
    });
    console.log('someone connected');

    return io
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket Not Initialized')
    }
    return io;
  }
};
