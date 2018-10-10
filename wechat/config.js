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
            thumbMediaId:"/cgi-bin/media/upload?access_token=%s&type=%s"
        }
    }
}