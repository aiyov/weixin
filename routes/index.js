const router = require('koa-router')()
const wechat  = require('../wechat/wechat')
const config  = require('../wechat/config')
const menus = require('../wechat/menu.json')
const util = require('util');

var wechatApp = new wechat(config)

router.get('/', (ctx, next) => {
  wechatApp.auth(ctx).then(()=>{
      wechatApp.getAccessToken().then(function(data){
          var url = util.format(wechatApp.apiURL.createMenu,wechatApp.apiDomain,data);
          //使用 Post 请求创建微信菜单
          wechatApp.requestPost(url,JSON.stringify(menus)).then(function(data){
              //将结果打印
              console.log(data);
          });
      });
  })
})

router.get('/getAccessToken',(ctx, next)=>{
  wechatApp.getAccessToken().then(function(data){
    ctx.body = data;
  });
});

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})
router.post('/',async (ctx, next)=>{
  console.log('===================')
  console.log(ctx)
  wechatApp.handleMsg(ctx.request,ctx.response);
})
module.exports = router
