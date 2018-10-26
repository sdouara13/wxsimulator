import event from '@/services/channelService'
export default class SocketIO {
  status = 0;   // 0: 离线 1:在线
  listener= null;
  Init(url, channels, callback) {
    this.url = url
    this.connect(url, channels, callback)
  }
  connect(url, channels, callback) {
    if(this.ws) {
      this.ws.close()
      this.ws = null;
      this.status = 0;
      console.log('关闭websocket连接')
    }
    const self = this
    this.ws = io (url, {
      path: "/websocket",
      forceNew: true,
      reconnection: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000
    });

    this.ws.open();
    setTimeout(() => {
      if(this.status === 0) {
        this.connect(this.url, channels, callback)
      }
    }, 2000);
    console.log('建立websocket连接')

    SocketIO.wsHandler = this.ws
    this.ws.on(channels.data, callback)
    this.ws.on(channels.heartbeat, function (data) {
      // console.log('heartbeat data', data)
      if(self.status === 0) {
        console.log('收到心跳，转换在线状态');
        self.status = 1;
        event.emit('ws-open');
        event.emit('online');
      }
    })

    setInterval(() => {
      self.ws.emit(channels.heartbeat, new ArrayBuffer(0));
    }, 5000)

    this.ws.on('connect',  () => {
      console.log('websocket连接成功', self.ws.connected);
      self.status = 1;
      event.emit('ws-open');
      event.emit('online');
    });

    this.ws.on('reconnect', (attemptNumber) => {
      console.log('websocket重连接成功', self.ws.connected);
      self.status = 1;
      event.emit('ws-open');
      event.emit('online');
    });

    this.ws.on('disconnect', () => {
      console.log('websocket断开连接');
      self.status = 0;
      self.ws.close();
      event.emit('offline');

      setTimeout(function () {
        self.connect(self.url, channels, callback);
      }, 0);
    });
    event.destroy('to-ws', this.listener);
    event.on('to-ws', this.listener = function (obj) {
      if(!self.ws) {
        event.emit('to-ws-error', obj);
        return;
      }
        self.ws.emit(channels.data, obj)
    })
  }
}
