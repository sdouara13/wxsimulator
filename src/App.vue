<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import { getParam } from "@/utils/getParam"
  import { API } from "@/constants/API"
  import { list } from "@/constants/wxAPI"
  import channel from "@/services/channelService";

  import { Send, SimpleSend } from "@/services/websocketService/action"

  export default {
    name: 'App',
    data() {
      return {
        id: getParam("deviceid"),
        regist: null
      }
    },
    mounted() {
      channel.on('ws-open', () => {
        this.Init();
      })
    },
    methods: {
      Init() {
        /**
         * 设备登入
         * */
        this.registDevice();
        /**
         * 注册微信
         * */
        this.wxInit();
      },
      registDevice() {
        this.regist = Send({
          cmd: 'regist',
          seqno: "123456",
          id: this.id
        });
        this.regist.promise.then(() => {
          // 通知广播服务器成功
          console.log("通知广播服务器成功");
          this.regist.clear();
        });
      },
      wxInit() {
        const timestamp = Date.now() / 1000 >> 0;
        const nonceStr = Math.random().toString();
        this.get(API.getToken, {
          timestamp,
          nonceStr
        })
          .then((res) => {
            console.log("获取签名", res);
            if (res.data) {
              wx.config({
                debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: 'wxaca505e7b260c383', // 必填，公众号的唯一标识
                timestamp, // 必填，生成签名的时间戳
                nonceStr, // 必填，生成签名的随机串
                signature: res.data, // 必填，签名
                jsApiList: list // 必填，需要使用的JS接口列表
              });
            } else {
              console.error("获取签名失败")
            }

          });

        /**
         * 验证结果
         * */
        wx.ready(function () {
          console.log("微信验证成功");
        })
        const self = this;
        wx.error(function(res){
          console.error("微信验证失败", res, "三秒后重试");
          // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
          setTimeout(() => {
            self.Init();
          }, 3000)
        });
      }
    },
    destroyed() {
      if (this.regist) {
        this.regist.clear();
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
