// src/Config/WebSocketService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import store from '../Redux/Store/Store';
import { setConnected, setError, addMessage } from '../Redux/Chat/Action';
import { BASE_URL } from './api';

class WebSocketService {
  constructor(token) {
    this.token = token;
    this.stompClient = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect() {
    const socket = new SockJS(`${BASE_URL}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${this.token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.reconnectAttempts = 0;
        store.dispatch(setConnected(true));
        this.subscribeToPrivateMessages();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.handleConnectionError();
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.handleConnectionError();
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
        store.dispatch(setConnected(false));
        this.handleConnectionError();
      }
    });

    this.stompClient.activate();
  }

  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      store.dispatch(setError('Connection lost. Please refresh the page.'));
    }
  }

  handleTokenError() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  subscribeToPrivateMessages() {
    if (!this.stompClient) return;

    this.stompClient.subscribe('/user/queue/messages', (message) => {
      try {
        const chatMessage = JSON.parse(message.body);
        store.dispatch(addMessage(chatMessage));
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  }

  sendMessage(receiverId, content) {
    if (!this.stompClient) {
      store.dispatch(setError('Not connected to server'));
      return;
    }

    try {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          receiverId,
          content
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
      store.dispatch(setError('Failed to send message'));
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      store.dispatch(setConnected(false));
    }
  }
}

export default WebSocketService;