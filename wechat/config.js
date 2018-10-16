module.exports = {
  wechat: {
    // appID: 'wx99bb0b808bb1a406',
    appID: 'wxffda237719758704',
    // appScrect: 'fc96a3da368328d1d59839d54b640375',
    appScrect: '625cbb593d5f6794a15946b274cfd077',
    token: 'aiyov',
    apiDomain: "https://api.weixin.qq.com/",
    apiURL: {
      accessTokenApi: "%scgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
      createMenu: "%scgi-bin/menu/create?access_token=%s",
      uploadimg: "%scgi-bin/media/uploadimg?access_token=%s",
      groupMessage: "%scgi-bin/message/mass/sendall?access_token=%s",
      material: "%scgi-bin/material/batchget_material?access_token=%s",
      mediaId: "%scgi-bin/media/upload?access_token=%s&type=%s", /*新增临时素材*/
      thumbMediaId: "%scgi-bin/material/add_material?access_token=%s&type=%s", /*新增永久素材*/
      addNews: "%scgi-bin/material/add_news?access_token=%s",
      clearQuota: "%scgi-bin/clear_quota?access_token=%s",
      user: {
        getUserList: "%scgi-bin/user/get?access_token=%s&next_openid=%s",
        userInfo: "%scgi-bin/user/info?access_token=%s&openid=%s&lang=zh_CN",
        createTag: "%scgi-bin/tags/create?access_token=%s",
        getTagList: "%scgi-bin/tags/get?access_token=%s"
      }
    }
  }
}