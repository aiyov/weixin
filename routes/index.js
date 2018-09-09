const router = require('koa-router')()
const wechat  = require('../wechat/wechat')
const config  = require('../wechat/config')
const menus = require('../wechat/menu.json')
const util = require('util');
const accessTokenJson = require('../wechat/access_token.json')

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
  await ctx.render('index')
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})
router.post('/',async(ctx, next)=>{
  await wechatApp.handleMsg(ctx).then((result)=>{
    ctx.res.setHeader('Content-Type', 'application/xml')
    ctx.res.end(result)
  });
})

router.post('/file-upload',async(ctx, next)=>{
    console.log(ctx.req.file)
    var buffer = [];
    //监听 data 事件 用于接收数据
    ctx.req.addListener('data', function (data) {
        buffer.push(data);
    });
    ctx.req.addListener('end', function () {
        var img = Buffer.concat(buffer).toString('utf-8');
        var url = util.format(wechatApp.apiURL.uploadimg,wechatApp.apiDomain,accessTokenJson.access_token);
        wechatApp.requestPost(url,img).then(function(data){
            //将结果打印
            ctx.body = data;
            console.log(data)
        });
    })

})

router.get('/uploadimg',async(ctx, next)=>{
    var url = util.format(wechatApp.apiURL.uploadimg,wechatApp.apiDomain,accessTokenJson.access_token);
    //使用 Post 请求图片地址
    const data = {
        media: '../public/images/vue.png'
    }
    await wechatApp.requestPost(url,new FormData(data)).then(function(data){
        //将结果打印
        ctx.body = data;
    });
})

router.get('/groupmessage',async(ctx, next)=>{
    await wechatApp.groupMessage().then(function(data){
        //将结果打印
        ctx.body = data;
    });
})

module.exports = router
