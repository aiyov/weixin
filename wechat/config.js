module.exports = {
  wechat: {
    appID: 'wx99bb0b808bb1a406',
    appScrect: 'fc96a3da368328d1d59839d54b640375',
    token: 'aiyov',
    apiDomain: "https://api.weixin.qq.com/",
    apiURL: {
      accessTokenApi: "%scgi-bin/token?grant_type=client_credential&appid=%s&secret=%s"
    }
  }
}