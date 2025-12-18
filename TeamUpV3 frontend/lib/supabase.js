import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
// Go to: https://app.supabase.com → Your Project → Settings → API

const SUPABASE_URL = 'https://fkjqledmjvyftoyxtoix.supabase.co'; // Replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZranFsZWRtanZ5ZnRveXh0b2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzc3NDQsImV4cCI6MjA4MTYxMzc0NH0.fcD5IQqBFJeZbRJsWARwQ9SipKujbPQl6R1KFj9MVHs'; // Replace with your anon key

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations

// Authentication
export const authHelpers = {
  // Sign up
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Profile operations
export const profileHelpers = {
  // Get profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Get all profiles
  getAllProfiles: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
};

// Team operations
export const teamHelpers = {
  // Get all teams
  getAllTeams: async () => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        created_by_profile:profiles!teams_created_by_fkey(id, full_name, email),
        team_members(
          id,
          user_id,
          joined_at,
          role,
          profiles:user_id(id, full_name, email, role, skills, interests, description, phone, availability)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get user's created teams (as team lead)
  getMyTeams: async (userId) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          user_id,
          joined_at,
          role,
          profiles:user_id(id, full_name, email, role, skills, interests, description, phone, availability)
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get teams where user is a member (joined teams)
  getJoinedTeams: async (userId) => {
    // First get team_ids where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);
    
    if (memberError) return { data: null, error: memberError };
    
    if (!membererships || memberships.length === 0) {
      return { data: [], error: null };
    }
    
    const teamIds = memberships.map(m => m.team_id);
    
    // Get teams where user is a member but NOT the creator
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        created_by_profile:profiles!teams_created_by_fkey(id, full_name, email, role),
        team_members(
          id,
          user_id,
          joined_at,
          role,
          profiles:user_id(id, full_name, email, role, skills, interests, description, phone, availability)
        )
      `)
      .in('id', teamIds)
      .neq('created_by', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get single team
  getTeam: async (teamId) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        created_by_profile:profiles!teams_created_by_fkey(id, full_name, email),
        team_members(
          id,
          user_id,
          joined_at,
          role,
          profiles:user_id(id, full_name, email, role, skills, interests, description, phone, availability)
        )
      `)
      .eq('id', teamId)
      .single();
    return { data, error };
  },

  // Create team
  createTeam: async (teamData) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();
    return { data, error };
  },

  // Update team
  updateTeam: async (teamId, updates) => {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();
    return { data, error };
  },

  // Delete team
  deleteTeam: async (teamId) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    return { error };
  },

  // Add member to team
  addMember: async (teamId, userId, role = 'Member') => {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role,
      }])
      .select()
      .single();
    return { data, error };
  },

  // Remove member from team
  removeMember: async (teamId, userId) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    return { error };
  },

  // Search teams
  searchTeams: async (query) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          user:profiles(id, full_name)
        )
      `)
      .eq('status', 'active')
      .or(`team_name.ilike.%${query}%,description.ilike.%${query}%,project_type.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    return { data, error };
  },
};

// Notification operations
export const notificationHelpers = {
  // Get notifications
  getNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });
    
    // Transform snake_case to camelCase
    if (data) {
      const transformed = data.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        teamId: n.team_id,
        teamName: n.team_name,
        recipientId: n.recipient_id,
        senderId: n.sender_id,
        senderName: n.sender_name,
        senderRole: n.sender_role,
        read: n.read,
        createdAt: n.created_at,
        metadata: n.metadata,
      }));
      return { data: transformed, error: null };
    }
    return { data, error };
  },

  // Create notification
  createNotification: async (notificationData) => {
    // Transform camelCase to snake_case for database
    const dbNotification = {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      team_id: notificationData.teamId || notificationData.team_id,
      team_name: notificationData.teamName || notificationData.team_name,
      recipient_id: notificationData.recipientId || notificationData.recipient_id,
      sender_id: notificationData.senderId || notificationData.sender_id,
      sender_name: notificationData.senderName || notificationData.sender_name,
      sender_role: notificationData.senderRole || notificationData.sender_role,
      metadata: notificationData.metadata,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([dbNotification])
      .select()
      .single();
    
    // Transform response back to camelCase
    if (data) {
      return {
        data: {
          id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          teamId: data.team_id,
          teamName: data.team_name,
          recipientId: data.recipient_id,
          senderId: data.sender_id,
          senderName: data.sender_name,
          senderRole: data.sender_role,
          read: data.read,
          createdAt: data.created_at,
          metadata: data.metadata,
        },
        error: null,
      };
    }
    return { data, error };
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false)
      .select();
    return { data, error };
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    return { error };
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    return { count: count || 0, error };
  },

  // Subscribe to notifications (realtime)
  subscribeToNotifications: (userId, callback) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// Message operations
export const messageHelpers = {
  // Get or create a conversation between two users
  getOrCreateConversation: async (userId1, userId2) => {
    // Ensure consistent ordering of participants
    const [participant1, participant2] = [userId1, userId2].sort();
    
    // Try to find existing conversation
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
      .single();
    
    if (existing) {
      return { data: existing, error: null };
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant_1: participant1,
        participant_2: participant2,
      }])
      .select()
      .single();
    
    return { data, error };
  },

  // Get all conversations for a user with participant info and last message
  getConversations: async (userId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, email, avatar_url, role),
        participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, email, avatar_url, role)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    
    if (error) return { data: null, error };

    // For each conversation, get the last message
    const conversationsWithLastMessage = await Promise.all(
      data.map(async (conv) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastMessage = messages?.[0] || null;
        
        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', userId);
        
        // Determine the other participant
        const otherParticipant = conv.participant_1 === userId 
          ? conv.participant_2_profile 
          : conv.participant_1_profile;
        
        return {
          id: conv.id,
          otherUser: otherParticipant,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            senderId: lastMessage.sender_id,
            read: lastMessage.read,
            createdAt: lastMessage.created_at,
          } : null,
          unreadCount: count || 0,
          lastMessageAt: conv.last_message_at,
          createdAt: conv.created_at,
        };
      })
    );
    
    return { data: conversationsWithLastMessage, error: null };
  },

  // Get messages for a conversation
  getMessages: async (conversationId, limit = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) return { data: null, error };
    
    // Transform to camelCase
    const transformed = data.map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      read: m.read,
      createdAt: m.created_at,
      sender: m.sender,
    }));
    
    return { data: transformed, error: null };
  },

  // Send a message
  sendMessage: async (conversationId, senderId, content) => {
    // Insert message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      }])
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .single();
    
    if (msgError) return { data: null, error: msgError };
    
    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return {
      data: {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        read: message.read,
        createdAt: message.created_at,
        sender: message.sender,
      },
      error: null,
    };
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId, userId) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);
    
    return { error };
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages: (conversationId, callback) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            callback({
              id: data.id,
              conversationId: data.conversation_id,
              senderId: data.sender_id,
              content: data.content,
              read: data.read,
              createdAt: data.created_at,
              sender: data.sender,
            });
          }
        }
      )
      .subscribe();
  },

  // Subscribe to conversation updates (for new conversations or updates)
  subscribeToConversations: (userId, callback) => {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          // Check if user is a participant
          const conv = payload.new;
          if (conv && (conv.participant_1 === userId || conv.participant_2 === userId)) {
            callback(payload);
          }
        }
      )
      .subscribe();
  },
};
