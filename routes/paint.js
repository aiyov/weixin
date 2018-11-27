const router = require('koa-router')();
const greenlock = require('greenlock-express');
const websockify = require('koa-wss');
const app = require('../app')
router.prefix('/paint');

const le = greenlock.create({
  // all your sweet Let's Encrypt options here
});

// the magic happens right here
const paint = websockify(app, wsOptions, le.httpsOptions);

paint.ws.use((ctx) => {
  // the websocket is added to the context as `ctx.websocket`.
  ctx.websocket.on('message', function(message) {
    // do something
  });
});
module.exports = router