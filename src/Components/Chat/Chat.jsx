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

    // Add event listeners to the raw socket for better error handling
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

    client.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      setConnected(true);
      setStompClient(client);
      setError(null); // Clear any previous errors

      // Subscribe to user-specific messages
      client.subscribe('/user/queue/messages', (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('Received message:', messageData);

          // If the message is from the currently selected user, add it to the messages
          if (selectedUser && messageData.senderId === selectedUser.id) {
            setMessages(prevMessages => [...prevMessages, messageData]);
            scrollToBottom();

            // Mark message as read
            if (messageData.id) {
              axios.put(`/api/messages/read/${messageData.id}`, {}, apiConfig)
                .catch(err => console.error('Error marking message as read:', err));
            }
          } else {
            // If message is from another user, refresh the conversation
            // This ensures the UI stays in sync with the latest messages
            if (selectedUser) {
              fetchConversation(selectedUser.id);
            }
          }

          // Update unread counts and recent chats
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

      // Try to reconnect after a delay
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
      // Mark all messages as read
      await axios.put(`/api/messages/read-all/${userId}`, {}, apiConfig);
      // Update unread counts
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
      // Lấy danh sách following
      const followingRes = await axios.get(`/api/users/${myId}/following`, apiConfig);
      // Lấy danh sách follower
      const followerRes = await axios.get(`/api/users/${myId}/follower`, apiConfig);
      // Gộp và loại trùng
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
      const currentUserId = parseInt(localStorage.getItem('userId'));
      const messageData = {
        receiverId: selectedUser.id,
        content: newMessage
      };

      // Create a temporary message object for UI
      const tempMessage = {
        id: Date.now(), // Temporary ID
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

      // Add message to UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      scrollToBottom();

      // Try to send through WebSocket if connected
      if (stompClient && connected) {
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageData)
        });
        console.log('Message sent via WebSocket');
      } else {
        // Fallback to REST API
        console.log('WebSocket not connected, using REST API fallback');
        const response = await axios.post('/api/messages/send', messageData, apiConfig);

        // Update the temporary message with the actual message data
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');

      // Try to reconnect WebSocket
      if (!connected) {
        connectWebSocket();
      }
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/messages/${messageId}`, apiConfig);
      // Remove the message from the UI
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  // Select a user to chat with
  const selectUser = (user) => {
    setSelectedUser(user);
    fetchConversation(user.id);

    // Ensure WebSocket connection is active
    if (!connected) {
      console.log('WebSocket not connected, reconnecting...');
      connectWebSocket();
    }

    // Update URL without reloading the page
    navigate(`/chat/${user.id}`);
  };

  const startNewChat = () => {
    setShowNewChatModal(true);
    fetchSuggestedUsers();
  };

  const closeNewChatModal = () => {
    setShowNewChatModal(false);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Render timestamp in a readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // New Chat Modal Component
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

    // Nếu không search thì hiển thị suggestedUsers, nếu có search thì hiển thị searchResults
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

  // Initial load and WebSocket setup
  useEffect(() => {
    fetchRecentChats();
    fetchUnreadCounts();
    connectWebSocket();

    // Set up periodic connection check
    const connectionCheckInterval = setInterval(() => {
      if (!connected) {
        console.log('WebSocket connection check: disconnected, reconnecting...');
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

  // Handle URL parameter for user selection
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
          <h2>Messages</h2>
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
            {recentChats.map(user => (
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
              <span className="username">{selectedUser.username}</span>
              <div className="connection-status">
                {connected ? (
                  <span className="status-connected">Connected</span>
                ) : (
                  <span className="status-disconnected">Disconnected</span>
                )}
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.senderId === parseInt(localStorage.getItem('userId')) ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.content}
                    <span className="message-time">{formatTime(message.sentAt)}</span>
                    {message.senderId === parseInt(localStorage.getItem('userId')) && (
                      <button 
                        className="delete-btn" 
                        onClick={() => deleteMessage(message.id)}
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
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
      {showNewChatModal && <NewChatModal />}
    </div>
  );
};

export default Chat;