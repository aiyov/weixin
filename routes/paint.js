const router = require('koa-router')();
const app = require('../app');
const websocket = require('websocket');
const http = require('http');
const WebSocketServer = websocket.server;

let httpServer = http.createServer();
console.log(123456)

// 创建一个websocket Server，websocket Server需要建立在http server之上
let wsServer = new WebSocketServer({
    host: '192.168.1.232',
    port: 3000,
    path: '/',
    httpServer: httpServer,
    autoAcceptConnections: true
});
console.log(wsServer)
// 事件监听
wsServer.on("connect", (connection) => {
    console.log(">>>come from: " + connection.remoteAddress); // 显示连接客户端的ip地址
    connection.on("message", (message) => {
        console.log(message.type);
        console.log(">>>message: ", message); // 接收到信息的类型和内容，注意都是utf8编码
        connection.sendUTF(message.utf8Data); // 把接收到的信息发回去
    });

    connection.on("close", (reasonCode, description) => {
        console.log(connection.remoteAddress + " has disconnected.");
    });
});

module.exports = router