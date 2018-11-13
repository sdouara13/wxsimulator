<template>
    <div>
      {{ content }}
    </div>
</template>

<script>
  import { getParam } from "@/utils/getParam"
  import channel from "@/services/channelService";
  import { Send, SimpleSend } from "@/services/websocketService/action"

  export default {
    name: "index",
    components: {
    },
    mounted() {
      channel.on("from-ws", obj => {
        console.log("接收到命令字", obj)
        if(obj && obj.cmd) {
          switch(obj.cmd) {
            case "scanQRCode": this.scanQRCode(obj.seqno)
          }
        }

      });
    },
    data () {
      return {
        content: "",
      }
    },
    methods: {
      scanQRCode(seqno) {
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
            this.content = result;
            console.log('发送扫一扫返回', result);
            SimpleSend({
              cmd: 'scanQRCode',
              seqno,
              deviceid: getParam("deviceid"),
              data: this.content
            });

          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
