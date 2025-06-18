import API from '../../Config/axios';
import webSocketService from '../../Config/WebSocket';

// Lấy danh sách user đã chat
export const fetchRecentChats = () => async (dispatch) => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const res = await API.get('/api/messages/recent');
    dispatch({ type: 'GET_RECENT_CHATS_SUCCESS', payload: res.data });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', payload: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Lấy hội thoại với 1 user
export const fetchConversation = (userId) => async (dispatch) => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const res = await API.get(`/api/messages/conversation/${userId}`);
    dispatch({ type: 'GET_CONVERSATION_SUCCESS', payload: res.data });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', payload: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Gửi tin nhắn qua WebSocket
export const sendMessage = (receiverId, content) => (dispatch) => {
  webSocketService.sendMessage(receiverId, content);
  // Tin nhắn sẽ được nhận lại qua RECEIVE_MESSAGE khi backend gửi về
};

// Nhận tin nhắn realtime
export const listenMessages = () => (dispatch, getState) => {
  const token = localStorage.getItem('token');
  webSocketService.connect(token, (msg) => {
    dispatch({ type: 'RECEIVE_MESSAGE', payload: msg });
  });
};