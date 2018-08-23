const router = require('koa-router')()
const sha1 = require('sha1')
var config = require('../wechat/index');


router.get('/', (ctx, next) => {
    var token = config.config.token;
    var signature = ctx.query.signature;
    var nonce = ctx.query.nonce;
    var timestamp = ctx.query.timestamp;
    var echostr = ctx.query.echostr;
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    if (sha === signature) {
        ctx.body = echostr + '';
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
