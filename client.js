const { port, infoChannelName, newTaskChannelName } = require("./config");

const connetServerPromise = new Promise(resolve => {
  const io = require("socket.io-client");
  const socket = io(`http://localhost:${port}`);
  socket.on("connect", () => resolve(socket));
});

connetServerPromise.then(socket => {
  socket.on(infoChannelName, data => console.log(new Date(), data));

  //Send new request
  console.log(new Date(), "Ask for help");
  socket.emit(newTaskChannelName, "Help me");
});
