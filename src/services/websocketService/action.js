import channel from '@/services/channelService';
import stringify from "json-stringify-safe";

/**
 * 一对一应答使用Send
 * */
export const Send = data => {
  let callback;
  let cmd = data.cmd;
  let seqno = data.seqno;
  let exceed = null;
  let destroy = function() {
    if (exceed) {
      clearTimeout(exceed);
      exceed = null;
    }
    channel.destroy('from-ws', callback);
  }
  return {
    promise: new Promise((resolve, reject) => {
      channel.on('from-ws', callback = (data) => {
        console.log('websocket 发送', data);
        if (data.cmd === cmd && data.seqno === seqno) {
          destroy();
          resolve(data);

        } else {
          console.error('websocket接收到空包');
        }
      });

      /**
       * 服务器返回超时
       * */
      exceed = setTimeout(() => {
        console.log('服务器返回超时,命令', cmd, stringify(data));
        destroy();
        /**
         * 发送超时信号
         */
        channel.emit('server_exceed');
        reject(`server_exceed: ${cmd}`);
        // fundebug.notify("Lost", stringify(data));
      }, 10 * 1000);

      channel.emit('to-ws', data);
      console.log(`向websocket服务器发送数据： ${stringify(data)}`)

    }),
    clear: destroy
  }
}

/**
 * 非一对一应答命令，一般为广播返回，直接发送，并监听该信号即可
 * */
export const SimpleSend = (data) => {
  channel.emit('to-ws', data);
}
