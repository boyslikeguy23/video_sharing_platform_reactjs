import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { BASE_URL } from './api';

const SOCKET_URL = `${BASE_URL}/ws`;

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscription = null;
  }

  connect(token, onMessageReceived) {
    const socket = new SockJS(SOCKET_URL);
    this.stompClient = Stomp.over(socket);

    const headers = { 'Authorization': `Bearer ${token}` };

    this.stompClient.connect(headers, () => {
      this.subscription = this.stompClient.subscribe(
        '/user/queue/messages',
        message => {
          const msg = JSON.parse(message.body);
          onMessageReceived(msg);
        }
      );
    });
  }

  sendMessage(receiverId, content) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(
        '/app/chat.send',
        {},
        JSON.stringify({ receiverId, content })
      );
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;