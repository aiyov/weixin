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

router.get('/', (ctx, next) => {
  wechatApp.auth(ctx).then(()=>{
    console.log(123)
      wechatApp.getAccessToken().then(function(data){
          var url = util.format(wechatApp.apiURL.createMenu,wechatApp.apiDomain,data);
          //使用 Post 请求创建微信菜单
        console.log(456)
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
    var form = new formidable.IncomingForm();
    form.parse(ctx.req,async function(err,fields,files){
        if(err){throw err; return;}
        console.log(files)
        var url = util.format(wechatApp.apiURL.uploadimg,wechatApp.apiDomain,accessTokenJson.access_token);
        request.post({url,formData:files}).then((data)=>{
            console.log(data)
            ctx.body = data;
        }).catch((error)=>{
            ctx.body = error;
        });
    });
})

router.get('/material',async(ctx, next)=>{
  await wechatApp.getAccessToken().then(async function(data){
    var url = util.format(wechatApp.apiURL.material,wechatApp.apiDomain,accessTokenJson.access_token);
    const body = {
      "type":"news",
      "offset":0,
      "count":5
    };
    await request({method: 'POST',json: true,uri:url,body:body}).then((data)=>{
      console.log(data)
      ctx.body = data;
    }).catch((error)=>{
      ctx.body = error;
    });
  });
})

router.get('/addnews',async(ctx, next)=>{
    var url = util.format(wechatApp.apiURL.addNews,wechatApp.apiDomain,accessTokenJson.access_token);
    await wechatApp.getMediaId().then(async (data)=>{
        console.log(data)
        var news = {
            "articles": [{
                "title": '完美',
                "thumb_media_id": data,
                "author": 'aiyov',
                "digest": '测试',
                "show_cover_pic": 1,
                "content": '这个是测试内容哦',
                "content_source_url": 'www.baidu.com'
            }]
        };
        /*await wechatApp.requestPost(url,JSON.stringify(news)).then((data)=>{
          console.log(data)
          ctx.body = data;
        }).catch((error)=>{
          console.log('失败'+error)
          ctx.body = error;
        })*/
        await request({method: 'POST',json: true,uri:url,body:news}).then((data)=>{
            console.log(data)
            ctx.body = data;
        }).catch((error)=>{
            ctx.body = error;
        });
    })
})


router.get('/uploadimg',async(ctx, next)=>{
    var url = util.format(wechatApp.apiURL.uploadimg,wechatApp.apiDomain,accessTokenJson.access_token);
    //使用 Post 请求图片地址
    const data = {
        media: fs.createReadStream(__dirname+'/vue.jpg')
    }
    await request.post({url,formData:data}).then((data)=>{
        ctx.body = data;
    }).catch((error)=>{
        ctx.body = error;
    });
})

router.get('/groupmessage',async(ctx, next)=>{
    await wechatApp.groupMessage().then(function(data){
        //将结果打印
        ctx.body = data;
    });
})

/*清除接口调用次数*/
router.get('/clear',async(ctx, next)=>{
  var url = util.format(wechatApp.apiURL.clearQuota,wechatApp.apiDomain,accessTokenJson.access_token);
  await request({method: "POST",uri:url,json:true,body: {appid:wechatApp.appID}}).then((data)=>{
    ctx.body = data;
  })
})

module.exports = router
