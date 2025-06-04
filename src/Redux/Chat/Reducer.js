const initialState = {
  messages: [],
  recentChats: [],
  selectedUser: null,
  loading: false,
  error: null
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SEND_MESSAGE_SUCCESS':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'RECEIVE_MESSAGE':
      // Nếu tin nhắn thuộc hội thoại đang mở thì thêm vào messages
      if (
        state.selectedUser &&
        (action.payload.senderId === state.selectedUser.id ||
          action.payload.receiverId === state.selectedUser.id)
      ) {
        return {
          ...state,
          messages: [...state.messages, action.payload]
        };
      }
      return state;
    case 'GET_CONVERSATION_SUCCESS':
      return {
        ...state,
        messages: action.payload
      };
    case 'GET_RECENT_CHATS_SUCCESS':
      return {
        ...state,
        recentChats: action.payload
      };
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export default chatReducer;