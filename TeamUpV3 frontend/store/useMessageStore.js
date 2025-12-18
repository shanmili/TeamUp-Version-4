import { create } from 'zustand';
import { messageHelpers } from '../lib/supabase';

const useMessageStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  error: null,

  // Fetch all conversations for the current user
  fetchConversations: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await messageHelpers.getConversations(userId);
      if (error) throw error;
      set({ conversations: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Get or create a conversation with another user
  startConversation: async (currentUserId, otherUserId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await messageHelpers.getOrCreateConversation(currentUserId, otherUserId);
      if (error) throw error;
      
      // Refresh conversations list
      await get().fetchConversations(currentUserId);
      
      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Set the current conversation
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  // Fetch messages for a conversation
  fetchMessages: async (conversationId, userId) => {
    set({ messagesLoading: true, error: null });
    try {
      const { data, error } = await messageHelpers.getMessages(conversationId);
      if (error) throw error;
      
      set({ messages: data || [], messagesLoading: false });
      
      // Mark messages as read
      await messageHelpers.markMessagesAsRead(conversationId, userId);
      
      // Update unread count in conversations
      const conversations = get().conversations.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      );
      set({ conversations });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: error.message, messagesLoading: false });
    }
  },

  // Send a message
  sendMessage: async (conversationId, senderId, content) => {
    try {
      const { data, error } = await messageHelpers.sendMessage(conversationId, senderId, content);
      if (error) throw error;
      
      // Add message to local state
      set(state => ({
        messages: [...state.messages, data],
      }));
      
      // Update conversation's last message
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: data, lastMessageAt: data.createdAt }
            : conv
        ),
      }));
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: error.message });
      return null;
    }
  },

  // Add a new message (from real-time subscription)
  addMessage: (message) => {
    set(state => {
      // Avoid duplicates
      if (state.messages.find(m => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    });
  },

  // Update conversation with new message (from real-time)
  updateConversationWithMessage: (conversationId, message, currentUserId) => {
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== currentUserId && state.currentConversation?.id !== conversationId
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount,
            }
          : conv
      ),
    }));
  },

  // Get total unread count
  getTotalUnreadCount: () => {
    return get().conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  },

  // Clear current conversation
  clearCurrentConversation: () => {
    set({ currentConversation: null, messages: [] });
  },

  // Reset store
  reset: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      loading: false,
      messagesLoading: false,
      error: null,
    });
  },
}));

export default useMessageStore;
