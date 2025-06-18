import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Chat.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { BASE_URL } from '../../Config/api';

axios.defaults.baseURL = BASE_URL;

const Chat = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [recentChats, setRecentChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  // Lấy userId của mình 1 lần duy nhất
  const userIdStr = localStorage.getItem('userId');
  console.log("userIdStr from localStorage:", userIdStr);
  const currentUserId = userIdStr ? parseInt(userIdStr, 10) : null;
  console.log("currentUserId:", currentUserId);
  // Get the JWT token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return '';
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  // API call configuration with authorization header
  const apiConfig = {
    headers: {
      'Authorization': getToken(),
      'Content-Type': 'application/json'
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (stompClient) {
      stompClient.deactivate();
    }

    const token = getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    const socket = new SockJS(`${BASE_URL}/ws`);

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setConnected(false);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed with code:', event.code);
      setConnected(false);
    };

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Authorization': token
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    setStompClient(client);

    client.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      setConnected(true);
      setStompClient(client);
      setError(null);

      client.subscribe('/user/queue/messages', (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('Received message:', messageData);

          if (messageData.eventType === 'MESSAGE_DELETED') {
            setMessages(prev => prev.filter(msg => msg.id !== messageData.messageId));
            fetchRecentChats();
            return;
          }

          if (selectedUser && messageData.senderId === selectedUser.id) {
            setMessages(prevMessages => [...prevMessages, messageData]);
            scrollToBottom();

            if (messageData.id) {
              axios.put(`/api/messages/read/${messageData.id}`, {}, apiConfig)
                .catch(err => console.error('Error marking message as read:', err));
            }
          } else {
            if (selectedUser) {
              fetchConversation(selectedUser.id);
            }
          }

          fetchUnreadCounts();
          fetchRecentChats();
        } catch (err) {
          console.error('Error processing received message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setError('Failed to connect to WebSocket');
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);

      setTimeout(() => {
        if (!client.active) {
          console.log('Attempting to reconnect WebSocket...');
          client.activate();
        }
      }, 5000);
    };

    client.activate();
  };

  // Fetch recent chats
  const fetchRecentChats = async () => {
    try {
      const response = await axios.get('/api/messages/recent', apiConfig);
      setRecentChats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recent chats:', err);
      setError('Failed to load recent chats');
      setLoading(false);
    }
  };

  // Fetch unread message counts
  const fetchUnreadCounts = async () => {
    try {
      const response = await axios.get('/api/messages/unread/count', apiConfig);
      setUnreadCounts(response.data.unreadCountsBySender || {});
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  // Fetch conversation with a specific user
  const fetchConversation = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/conversation/${userId}`, apiConfig);
      setMessages(response.data);
      await axios.put(`/api/messages/read-all/${userId}`, {}, apiConfig);
      fetchUnreadCounts();
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const fetchSuggestedUsers = async () => {
    const myId = localStorage.getItem('userId');
    if (!myId || myId === 'null' || isNaN(Number(myId))) {
      setSuggestedUsers([]);
      alert('Không tìm thấy userId. Vui lòng đăng nhập lại!');
      return;
    }
    try {
      const followingRes = await axios.get(`/api/users/${myId}/following`, apiConfig);
      const followerRes = await axios.get(`/api/users/${myId}/follower`, apiConfig);
      const all = [...followingRes.data, ...followerRes.data];
      const unique = [];
      const ids = new Set();
      for (const u of all) {
        if (!ids.has(u.id)) {
          unique.push(u);
          ids.add(u.id);
        }
      }
      setSuggestedUsers(unique);
    } catch (err) {
      console.error('Error fetching suggested users:', err);
      setSuggestedUsers([]);
    }
  };

  // Send message through WebSocket or REST API as fallback
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        receiverId: selectedUser.id,
        content: newMessage
      };

      const tempMessage = {
        id: Date.now(),
        senderId: currentUserId,
        receiverId: selectedUser.id,
        content: newMessage,
        sentAt: new Date().toISOString(),
        read: false,
        sender: {
          id: currentUserId,
          name: localStorage.getItem('name') || '',
          username: localStorage.getItem('username') || '',
          userImage: localStorage.getItem('userImage') || ''
        },
        receiver: {
          id: selectedUser.id,
          name: selectedUser.name || '',
          username: selectedUser.username || '',
          userImage: selectedUser.userImage || selectedUser.image || ''
        }
      };

      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      scrollToBottom();

      if (stompClient && connected) {
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageData)
        });
        fetchRecentChats();

        console.log('Message sent via WebSocket');
        // Không gọi API nữa, tin nhắn sẽ được cập nhật khi nhận từ WebSocket
      } else {
        // Nếu không có WebSocket, gửi qua API và cập nhật lại ID thực
        const response = await axios.post('/api/messages/send', messageData, apiConfig);
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        );
        fetchRecentChats();

      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      if (!connected) {
        connectWebSocket();
      }
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: '/app/chat.delete',
        body: String(messageId)
      });
    } else {

      // alert("Websocket chưa kết nối")
      axios.delete(`/api/messages/messages/${messageId}`, apiConfig)
        .then(() => {
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
          fetchRecentChats();
        })
        .catch(err => {
          console.error('Error deleting message:', err);
          setError('Failed to delete message');
        });
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    fetchConversation(user.id);
    if (!connected) {
      connectWebSocket();
    }
    navigate(`/chat/${user.id}`);
  };

  const startNewChat = () => {
    setShowNewChatModal(true);
    fetchSuggestedUsers();
  };

  const closeNewChatModal = () => {
    setShowNewChatModal(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const NewChatModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const searchUsers = async () => {
      if (!searchTerm.trim()) return;
      try {
        const response = await axios.get(`/api/users/search?q=${searchTerm}`, apiConfig);
        setSearchResults(response.data);
      } catch (err) {
        setSearchResults([]);
      }
    };

    const displayUsers = searchTerm.trim() ? searchResults : suggestedUsers;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <span>Tin nhắn mới</span>
            <button className="close-btn" onClick={closeNewChatModal}>×</button>
          </div>
          <div className="modal-search">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUsers()}
            />
            <button onClick={searchUsers}>Tìm</button>
          </div>
          <div className="modal-suggest-list">
            {displayUsers.map(user => (
              <div
                key={user.id}
                className="modal-user-item"
                onClick={() => {
                  setShowNewChatModal(false);
                  selectUser(user);
                }}
              >
                <img
                  src={
                    (user.userImage || user.image)
                      ? (user.userImage || user.image).startsWith('http')
                        ? (user.userImage || user.image)
                        : `${BASE_URL.replace(/\/$/, '')}/${(user.userImage || user.image).replace(/^\//, '')}`
                      : 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'
                  }
                  alt={user.username}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'; }}
                />
                <div>
                  <div className="username">{user.username}</div>
                  <div className="name">{user.name}</div>
                </div>
              </div>
            ))}
            {displayUsers.length === 0 && (
              <div style={{ padding: 16, color: '#888' }}>Không có gợi ý</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchRecentChats();
    fetchUnreadCounts();
    connectWebSocket();

    const connectionCheckInterval = setInterval(() => {
      if (!connected) {
        connectWebSocket();
      }
    }, 30000);

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
      clearInterval(connectionCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (userId && recentChats.length > 0) {
      const user = recentChats.find(chat => chat.id === parseInt(userId));
      if (user) {
        selectUser(user);
      }
    }
  }, [userId, recentChats]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="chat-container">
      {/* Left sidebar with recent chats */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Tin nhắn</h2>
          <button className="new-chat-btn" onClick={startNewChat}>
            <i className="fa fa-edit"></i>
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
         <div className="recent-chats">
            {[...recentChats]
              .sort((a, b) => {
              const aTime = a.lastMessage?.sentAt || a.lastMessage?.createdAt;
              const bTime = b.lastMessage?.sentAt || b.lastMessage?.createdAt;
              if (!aTime && !bTime) return 0;
              if (!aTime) return 1;   // a không có lastMessage => xuống cuối
              if (!bTime) return -1;  // b không có lastMessage => xuống cuối
              return new Date(bTime) - new Date(aTime);
            })
              .map(user => (
                <div 
                  key={user.id} 
                  className={`chat-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => selectUser(user)}
                >
                  <div className="avatar-container">
                    <img
                      src={
                        (user.userImage || user.image)
                          ? (user.userImage || user.image).startsWith('http')
                            ? (user.userImage || user.image)
                            : `${BASE_URL.replace(/\/$/, '')}/${(user.userImage || user.image).replace(/^\//, '')}`
                          : 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'
                      }
                      alt={user.username}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'; }}
                    />
                    {unreadCounts[user.id] > 0 && (
                      <span className="unread-badge">{unreadCounts[user.id]}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Right side with conversation */}
      <div className="conversation">
        {selectedUser ? (
          <>
            <div className="conversation-header">
              <img
                src={
                  (selectedUser.userImage || selectedUser.image)
                    ? (selectedUser.userImage || selectedUser.image).startsWith('http')
                      ? (selectedUser.userImage || selectedUser.image)
                      : `${BASE_URL.replace(/\/$/, '')}/${(selectedUser.userImage || selectedUser.image).replace(/^\//, '')}`
                    : 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'
                }
                alt={selectedUser.username}
                onError={e => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/mxtungfinalproject/image/upload/v1749298887/default_avatar_pb0sdc.jpg'; }}
              />
              <span 
                className="username" 
                style={{ cursor: 'pointer'}}
                onClick={() => navigate(`/${selectedUser.username}`)}
              >
                {selectedUser.username}
              </span>
              {/* <div className="connection-status">
                {connected ? (
                  <span className="status-connected">Connected</span>
                ) : (
                  <span className="status-disconnected">Disconnected</span>
                )}
              </div> */}
            </div>
            
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.content}
                    <span className="message-time">{formatTime(message.sentAt)}</span>
                    {message.senderId === currentUserId && (
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="message-input">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <p>Chọn một đoạn hội thoại hoặc bắt đầu cuộc hội thoại mới</p>
          </div>
        )}
      </div>
      {showNewChatModal && <NewChatModal />}
    </div>
  );
};

export default Chat;