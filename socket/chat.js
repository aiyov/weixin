const websocket = require('websocket');
const WebSocketServer = websocket.server;

function paintSocket(httpServer) {
  const wsServer = new WebSocketServer({
    path: '/chat',
    httpServer: httpServer,
    autoAcceptConnections: true
  });
// 事件监听
  wsServer.on("connect", (connection) => {
    console.log("chat >>>come from: " + connection.remoteAddress); // 显示连接客户端的ip地址
    connection.on("message", (message) => {
      console.log(message.type);
      console.log("chat >>>message: ", message); // 接收到信息的类型和内容，注意都是utf8编码
      connection.sendUTF(message.utf8Data); // 把接收到的信息发回去
    });

    connection.on("close", (reasonCode, description) => {
      console.log(connection.remoteAddress + " has disconnected.");
    });
  });
  return wsServer
}

module.exports = paintSocket