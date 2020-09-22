const express = require("express");
const http = require("http");

const { port, infoChannelName, newTaskChannelName, queueName } = require("./config");

const RabbitMqRpcChannel = require("./RabbitMqRpcChannel");
const TasksMap = new Map();

const app = express();
app.get("/", (req, res) => res.status(200).json("Server Is Up"));

const handler = http.Server(app);
const io = require("socket.io")(handler);

const rpcChannel = new RabbitMqRpcChannel(queueName);

rpcChannel.onTaskCompleted((id, data) => {
  const clientId = TasksMap.get(id);

  if (!clientId) return;

  const clients = io.sockets.clients().connected;

  socketId = Object.keys(clients).find(_ => _ === clientId);
  socketId && clients[socketId].emit(infoChannelName, `Task ${id} was completed. The result is: ${data}`);
});

io.on("connection", socket => {
  socket.on(newTaskChannelName, data => rpcChannel.newTask(data).then(id => TasksMap.set(id, socket.id)));
});

handler.listen(port);
