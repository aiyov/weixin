const sha1 = require('sha1');
const https = require('https');
const util = require('util');
var URL = require('url');
const fs = require('fs');
const msg = require('./msg');
const request = require('request-promise');
const accessTokenJson = require('./access_token.json')
const parseString = require('xml2js').parseString;//引入xml2js包

//构建 WeChat 对象 即 js中 函数就是对象
var WeChat = function (config) {
  //设置 WeChat 对象属性 config
  this.config = config.wechat;
  //设置 WeChat 对象属性 token
  this.token = config.wechat.token;
  //设置 WeChat 对象属性 appID
  this.appID = config.wechat.appID;
  //设置 WeChat 对象属性 appScrect
  this.appScrect = config.wechat.appScrect;
  //设置 WeChat 对象属性 apiDomain
  this.apiDomain = config.wechat.apiDomain;
  //设置 WeChat 对象属性 apiURL
  this.apiURL = config.wechat.apiURL;

  this.requestGet = function (url) {
    return new Promise(function (resolve, reject) {
      https.get(url, function (res) {
        var buffer = [], result = "";
        //监听 data 事件
        res.on('data', function (data) {
          buffer.push(data);
        });
        //监听 数据传输完成事件
        res.on('end', function () {
          result = buffer.toString('utf-8');
          //将最后结果返回
          resolve(result);
        });
      }).on('error', function (err) {
        reject(err);
      });
    });
  };

  this.requestPost = function (url, data) {
    return new Promise(function (resolve, reject) {
      //解析 url 地址
      var urlData = URL.parse(url);
      //设置 https.request  options 传入的参数对象
      var options = {
        //目标主机地址
        hostname: urlData.hostname,
        //目标地址
        path: urlData.path,
        //请求方法
        method: 'POST',
        //头部协议
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data, 'utf-8')
        }
      };
      var req = https.request(options, function (res) {
        var buffer = [], result = '';
        //用于监听 data 事件 接收数据
        res.on('data', function (data) {
          buffer.push(data);
        });
        //用于监听 end 事件 完成数据的接收
        res.on('end', function () {
          result = Buffer.concat(buffer).toString('utf-8');
          resolve(result);
        })
      })
      //监听错误事件
        .on('error', function (err) {
          console.log(err);
          reject(err);
        });
      //传入数据
      req.write(data);
      req.end();
    });
  }
}

/**
 * 微信接入验证
 */
WeChat.prototype.auth = function (option) {
  return new Promise((resolve, reject) => {
    var signature = option.query.signature,//微信加密签名
      timestamp = option.query.timestamp,//时间戳
      nonce = option.query.nonce,//随机数
      echostr = option.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [this.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');

    var resultCode = sha1(tempStr); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
      option.body = echostr + '';
      resolve()
    } else {
      resolve()
      option.body = {code: -1, msg: "fail"}
    }
  })
  //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
}

/*
* 获取accesstoken
* */

WeChat.prototype.getAccessToken = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    //获取当前时间
    var currentTime = new Date().getTime();
    //格式化请求地址
    var url = util.format(that.apiURL.accessTokenApi, that.apiDomain, that.appID, that.appScrect);
    //判断 本地存储的 access_token 是否有效
    if (accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime) {
      that.requestGet(url).then(function (data) {
        console.log(JSON.parse(data))
        var result = JSON.parse(data);
        if (data.indexOf("errcode") < 0) {
          accessTokenJson.access_token = result.access_token;
          accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
          //更新本地存储的
          fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson), function (err) {
            console.log(result.access_token)
            //将获取后的 access_token 返回
            resolve(accessTokenJson.access_token);
          })
        } else {
          //将错误返回
          resolve(result);
        }
      });
    } else {
      //将本地存储的 access_token 返回
      resolve(accessTokenJson.access_token);
    }
  });
}
WeChat.prototype.handleMsg = function (ctx) {
  return new Promise((resolve, reject) => {
    var buffer = [];
    //监听 data 事件 用于接收数据
    ctx.req.addListener('data', function (data) {
      buffer.push(data);
    });
    //监听 end 事件 用于处理接收完成的数据
    ctx.req.addListener('end', function () {
      var msgXml = Buffer.concat(buffer).toString('utf-8');
      console.log(msgXml)
      //解析xml
      parseString(msgXml, {explicitArray: false}, function (err, result) {
        if (!err) {
          result = result.xml;
          console.log(result)
          var toUser = result.ToUserName; //接收方微信
          var fromUser = result.FromUserName;//发送方微信
          //判断事件类型
          if (result.MsgType.toLowerCase() === "event") {
            switch (result.Event.toLowerCase()) {
              case 'subscribe':
                //回复消息
                resolve(msg.txtMsg(fromUser, toUser, '欢迎关注 aiyov 公众号，一起斗图吧'))
                break;
              case 'click':
                var contentArr = [
                  {
                    Title: "Node.js 微信自定义菜单",
                    Description: "使用Node.js实现自定义微信菜单",
                    PicUrl: "https://ss3.baidu.com/-fo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=23d5d41f44540923b569657ea258d1dc/dcc451da81cb39db18994d6add160924ab1830b4.jpg",
                    Url: "http://blog.csdn.net/hvkcoder/article/details/72868520"
                  },
                  {
                    Title: "Node.js access_token的获取、存储及更新",
                    Description: "Node.js access_token的获取、存储及更新",
                    PicUrl: "http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",
                    Url: "http://blog.csdn.net/hvkcoder/article/details/72783631"
                  },
                  {
                    Title: "Node.js 接入微信公众平台开发",
                    Description: "Node.js 接入微信公众平台开发",
                    PicUrl: "http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",
                    Url: "http://blog.csdn.net/hvkcoder/article/details/72765279"
                  }
                ];
                resolve(msg.graphicMsg(fromUser, toUser, contentArr))
                break;
              default:
                resolve(msg.txtMsg(fromUser, toUser, '欢迎关注 aiyov 公众号，一起斗图吧'))
                break;
            }
          } else if (result.MsgType.toLowerCase() === "text") {
            switch (result.Content) {
              case '1':
                resolve(msg.txtMsg(fromUser, toUser, 'hello, I am aiyov'))
                break;
              default:
                resolve(msg.txtMsg(fromUser, toUser, '请输入以下查询关键字：1 aiyov'))
                break;
            }
          } else if (result.MsgType.toLowerCase() === "voice") {
            switch (result.Recognition) {
              case '':
                resolve(msg.txtMsg(fromUser, toUser, '语音识别失败!'))
                break;
              default:
                resolve(msg.txtMsg(fromUser, toUser, '不,' + result.Recognition))
                break;
            }
          }
        } else {
          //打印错误信息
          console.log(err);
        }
      })
    });
  })
}
WeChat.prototype.groupMessage = function () {
  const data = {
    "filter": {
      "is_to_all": true,
    },
    "text": {
      "content": "这个是消息测试哦"
    },
    "msgtype": "text"
  };
  return new Promise((resolve, reject) => {
    const url = util.format(this.apiURL.groupMessage, this.apiDomain, accessTokenJson.access_token);
    console.log(data)
    this.requestPost(url, JSON.stringify(data)).then(function (message) {
      console.log(message)
      resolve(message)
    }).catch(function (error) {
      console.log(error)
    })
  })
}

WeChat.prototype.getMediaId = function () {
  var url = util.format(this.apiURL.thumbMediaId, this.apiDomain, accessTokenJson.access_token, 'thumb');
  //使用 Post 请求图片地址
  const data = {
    media: fs.createReadStream(__dirname + '/vue.jpg')/*缩略图 支持jpg，64KB最大*/
  }

  return new Promise((resolve, reject) => {
    request.post({url, formData: data}).then((data) => {
      console.log(data)
      resolve(JSON.parse(data).media_id)
    }).catch((error) => {
      reject(error)
    });
  })
}
/*获取用户列表*/
WeChat.prototype.getUserList = function () {
  var url = util.format(this.apiURL.user.getUserList, this.apiDomain, accessTokenJson.access_token, '');
  return new Promise((resolve, reject) => {
    request({method:"GET",uri:url}).then((data) => {
      console.log(data)
      resolve(data)
    }).catch((error) => {
      reject(error)
    });
  })
}
/*获取用户信息*/
WeChat.prototype.getUserInfo = function (openid) {
  var url = util.format(this.apiURL.user.userInfo, this.apiDomain, accessTokenJson.access_token, openid);
  return new Promise((resolve, reject) => {
    request({method:"GET",uri:url}).then((data) => {
      console.log(data)
      resolve(data)
    }).catch((error) => {
      reject(error)
    });
  })
}

/*创建标签*/
WeChat.prototype.createTag = function (tagname) {
  var url = util.format(this.apiURL.user.createTag, this.apiDomain, accessTokenJson.access_token);
  return new Promise((resolve, reject) => {
    var tag = {
      "tag" : {"name" : tagname}
    }
    request({method:"POST",uri:url,json:true,body: tag}).then((data) => {
      console.log(data)
      resolve(data)
    }).catch((error) => {
      reject(error)
    });
  })
}

/*获取标签列表*/
WeChat.prototype.getTagList = function (tagname) {
  var url = util.format(this.apiURL.user.getTagList, this.apiDomain, accessTokenJson.access_token);
  return new Promise((resolve, reject) => {
    request({method:"GET",uri:url}).then((data) => {
      console.log(data)
      resolve(data)
    }).catch((error) => {
      reject(error)
    });
  })
}

//暴露可供外部访问的接口
module.exports = WeChat;