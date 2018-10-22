const router = require('koa-router')();
const wechat  = require('../wechat/wechat');
const config  = require('../wechat/config');
const menus = require('../wechat/menu.json');
const formidable = require("formidable");
const fs = require('fs');
const util = require('util');
const accessTokenJson = require('../wechat/access_token.json');
const request = require('request-promise');

var wechatApp = new wechat(config)

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/getuserlist', async function (ctx, next) {
  await wechatApp.getAccessToken().then(async ()=>{
    await wechatApp.getUserList().then((data)=>{
      ctx.body = data;
    })
  })
})
router.get('/userInfo',async function (ctx,next) {
  await wechatApp.getAccessToken().then(()=>{
    return wechatApp.getUserList()
  }).then((data)=>{
    var openId = JSON.parse(data).data.openid[0]
    return wechatApp.getUserInfo(openId)
  }).then((data)=>{
    ctx.body = data;
  })
})

router.get('/createtag',async function (ctx,next) {
  await wechatApp.getAccessToken().then(()=>{
    return wechatApp.createTag('穷人')
  }).then((data)=>{
    ctx.body = data;
  })
})

router.get('/gettaglist',async function (ctx,next) {
  await wechatApp.getAccessToken().then(()=>{
    return wechatApp.getTagList()
  }).then((data)=>{
    ctx.body = data;
  })
})
module.exports = router
