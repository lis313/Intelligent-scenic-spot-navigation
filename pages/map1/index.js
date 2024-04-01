let QQMapWX = require("../../utils/qqmap/qqmap-wx-jssdk.min");
let qqmapsdk;
Page({
  data: {
    latitude: 31.002354,
    longitude: 104.22068,
    src: '',
    floors: ['F1', 'F2'],
    idChoosed: '-1',
    isPlay: false,
    isChoosed: '0',
    bg: '#ffffff',//'#99963f'
    audioUrl: [],
    album: [],
    albumSrc: '',
    iconUrl: '/images/讲解点.png',
    isTrue: true,
    textArry: [],
    text: '111',
    polygons: [
      {
        fillColor: 'transparent',
        level: 'aboveroads',
        strokeColor:'#f48e4d',
        strokeWidth:4,
        points: [
          { "latitude": 31.002975, "longitude": 104.218174 },
          { "latitude": 31.002424, "longitude": 104.218394 },
          { "latitude": 31.002405, "longitude": 104.218458 },
          { "latitude": 31.002520, "longitude": 104.219161 },
          { "latitude": 31.002488, "longitude": 104.219204 },
          { "latitude": 31.002148, "longitude": 104.219322 },
          { "latitude": 31.002125, "longitude": 104.219354 },
          { "latitude": 31.002180, "longitude": 104.219569 },
          { "latitude": 31.002157, "longitude": 104.219708 },
          { "latitude": 31.002102, "longitude": 104.219735 },
          { "latitude": 31.002042, "longitude": 104.219741 },
          { "latitude": 31.002019, "longitude": 104.219789 },
          { "latitude": 31.001968, "longitude": 104.219842 },
          { "latitude": 31.001932, "longitude": 104.219864 },
          { "latitude": 31.001913, "longitude": 104.219918 },
          { "latitude": 31.001881, "longitude": 104.220020 },
          { "latitude": 31.001890, "longitude": 104.220138 },
          { "latitude": 31.001968, "longitude": 104.220475 },
          { "latitude": 31.001798, "longitude": 104.222025 },
          { "latitude": 31.002534, "longitude": 104.221778 }
        ]
      },

    ],
    markers: [],
    showSport: false,
    showButtom: false,
    lastTimestamp: 0,
    lastLocation: null,
    speed: '0.00',
  },

  chooseFloor(e) {
    console.log(e);
    this.setData({
      isChoosed: e.currentTarget.id,
      showButtom: false,
      isPlay: false,

    });
    this.makeMarks();
  },
  showS() {
    this.setData({
      showSport: !this.data.showSport
    });
  },
  onReady: function (e) {
    console.log('111');
    wx.showLoading({
      title: '加载中',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
    this.mapCtx = wx.createMapContext('myMap');
    this.makeMarks();
    console.log(this.data.markers);
    this.createAudio();
    qqmapsdk = new QQMapWX({
      key: 'U2YBZ-W4MEN-4NSFM-SYVGY-7KP4K-XQBWQ' // 必填
    })
    setInterval(this.calculateSpeed, 5000);
  },
  //创建语音示例进行播放
  createAudio(e) {
    //创建内部 audio 上下文 InnerAudioContext 对象。
    this.innerAudioContext = wx.createInnerAudioContext();
    // 发生错误触发
    this.innerAudioContext.onError(function (res) { })
    //设置音频地址
    this.innerAudioContext.src = this.data.src;
  },
  daohang: function () {
    console.log('11122')
    const { idChoosed, markers } = this.data;
    this.setData({
      showButtom: false,
    })
    this.mapCtx.openMapApp({
      longitude: markers[idChoosed - 1].longitude,
      latitude: markers[idChoosed - 1].latitude,
      destination: markers[idChoosed - 1].title,
      success: function (res) { console.log(res) },
      fail: function (res) { console.log(res) },
      complete: function (res) { console.log(res) },

    }
    )
  },
  // 声明变量用于存储上一次获取位置信息的时间戳和位置信息




  // 获取位置信息并计算运动速率
  async calculateSpeed() {
    let { lastTimestamp, lastLocation } = this.data;
    wx.getLocation({
      type: 'gcj02', // 使用国测局坐标系
      success: (res) => {
        const currentTimestamp = new Date().getTime(); // 获取当前时间戳
        const currentLocation = res;
        // 如果是第一次获取位置信息，或者距离上次获取位置信息时间超过5秒，则重新设置lastTimestamp和lastLocation
        if (lastTimestamp === 0 || currentTimestamp - lastTimestamp >= 5000) {
          this.setData({
            lastTimestamp: currentTimestamp,
            lastLocation: currentLocation,
          })
          console.log("尚未计算速率，等待下一次获取位置信息...", lastTimestamp, lastLocation);
          return;
        }
        wx.request({
          url: 'https://apis.map.qq.com/ws/distance/v1/matrix?mode=walking',
          method: 'POST',
          data: {
            key: 'U2YBZ-W4MEN-4NSFM-SYVGY-7KP4K-XQBWQ',
            from: `${lastLocation.latitude},${lastLocation.longitude}`, //若起点有数据则采用起点坐标，若为空默认当前地址
            to: `${currentLocation.latitude},${currentLocation.longitude}`, //终点坐标
          },
          header: {
            'content-type': 'application/json' // 根据需求设置请求头
          },
          success: (res) => {
            console.log(res.data.result);
            const { rows } = res.data.result;
            const distance = rows[0].elements[0].distance;
            //  return res.data.result.rows[0].elements[0].distance
            // 计算速率（米/秒）
            const timeDifferenceInSeconds = (currentTimestamp - lastTimestamp) / 1000;
            const speed = distance / timeDifferenceInSeconds;

            // 更新lastTimestamp和lastLocation
            this.setData({
              lastTimestamp: currentTimestamp,
              lastLocation: currentLocation,
              speed: speed.toFixed(2),
            })

            console.log("当前速率为：" + speed.toFixed(2) + " 米/秒");
          },
          fail: function (err) {
            console.log(err);
          }
        });
      },
      fail: function (res) {
        console.log("获取位置信息失败：" + res.errMsg);
      }
    });
  }
  ,


  audio() {
    if (!this.data.isPlay) {
      // const id = Number(e.detail.markerId);
      this.setData({
        iconUrl: '/images/讲解.png',

      })
      this.audioPlay();

    }
    else {
      this.setData({
        iconUrl: '/images/讲解点.png',

      })
      this.audioPause();
    }
  },
  mTap: function (e) {
    const id = Number(e.detail.markerId);
    const { showButtom, idChoosed } = this.data;
    this.end()
    if (showButtom && id !== idChoosed) {
      this.setData({
        showButtom: true,
        src: this.data.audioUrl[id],
        albumSrc: this.data.album[id],
        text: this.data.textArry[id],
        idChoosed: id,
        isPlay: false,
        iconUrl: '/images/讲解点.png',
      })
    }
    else {
      this.setData({
        showButtom: !showButtom,
        src: this.data.audioUrl[id],
        albumSrc: this.data.album[id],
        text: this.data.textArry[id],
        idChoosed: id,
        isPlay: false,
        iconUrl: '/images/讲解点.png',
      })
    }

    console.log(e.detail.markerId);

  },
  makeMarks: function () {
    const isChoosed = Number(this.data.isChoosed);
    const { floors } = this.data;
    const { data } = this.getSXDData();
    // console.log(floors,isChoosed)
    this.setData({
      markers: [],
    })
    if (data.length != 0) {
      const m = [];
      const audioUrl = [];
      const album = [];
      const textArry = [];
      data.map((item) => {
        if (item.floor == floors[isChoosed]) {
          // console.log(item.floor,floors[isChoosed])
          const id = Number(item.info_id)
          const mark = {
            width: 36,
            height: 36,
            id: id,
            iconPath: item.icon,
            title: item.title,
            latitude: item.location.lat,
            longitude: item.location.lon,
            label:{
              content:item.title,
              bgColor:'#efebe1',
              borderRadius:20,
              textAlign:'center',
              padding:5,
            }
          }
          m.push(mark);
          audioUrl[id] = item.audio.url;
          album[id] = item.album[0];
          textArry[id] = item.title;
        }
      })
      console.log('m', m)
      this.setData({
        markers: m,
        audioUrl: audioUrl,
        album,
        textArry,
      })
    }


  },
  getSXDData: function () {
    return ({
      "code": 0,
      "msg": "",
      "data": [{
        "info_id": "1",
        "icon": "https://industry.map.qq.com/cloud/miniapp/museum/san/point/1.png",
        "title": "开场白",
        "floor": "F1",
        "location": {
          "lat": 31.002354,
          "lon": 104.22068
        },
        "album": ["https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/cloud/policy/1691659642559_iXZFKZra.JPG"],
        "audio": {
          "url": "https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/cloud/policy/1691659609114_Qhc33Ns5.mp3",
          "time": 114
        }
      },
      {
        "info_id": "2",
        "icon": "https://industry.map.qq.com/cloud/miniapp/museum/san/point/1.png",
        "title": "开场白2",
        "floor": "F1",
        "location": {
          "lat": 31.002354,
          "lon": 104.22098
        },
        "album": ["https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/cloud/policy/1691659642559_iXZFKZra.JPG"],
        "audio": {
          "url": "https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/cloud/policy/1691659609114_Qhc33Ns5.mp3",
          "time": 114
        }
      }]
    })
  },
  //播放
  audioPlay: function () {
    this.createAudio();
    //播放音频
    this.innerAudioContext.play();
    //设置当前播放按钮状态切换
    this.setData({
      isPlay: true
    })
  },

  // 停止播放
  audioPause() {
    //设置当前播放按钮状态切换
    this.setData({
      isPlay: false
    })
    //暂停音频 
    this.innerAudioContext.pause();

  },

  // 结束音频
  end: function (e) {
    //暂停音频 
    this.innerAudioContext.pause();
  },
  onHide: function () {
    // 结束音频
    this.end();
  },
  onUnload: function () {
    // 结束音频
    this.end();
  },


  calDis(start, end) {
    console.log(start, end);
    //调用距离计算接口
    wx.request({
      url: 'https://apis.map.qq.com/ws/distance/v1/matrix?mode=walking',
      method: 'POST',
      data: {
        key: 'U2YBZ-W4MEN-4NSFM-SYVGY-7KP4K-XQBWQ',
        from: start, //若起点有数据则采用起点坐标，若为空默认当前地址
        to: end, //终点坐标
      },
      header: {
        'content-type': 'application/json' // 根据需求设置请求头
      },
      success: function (res, data) {
        console.log(res.data.result);
        const { rows } = res.data.result;
        return (rows[0].elements[0].distance)
        //  return res.data.result.rows[0].elements[0].distance
      },
      fail: function (err) {
        console.log(err);
      }
    });

  }
})
