import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
// Go to: https://app.supabase.com → Your Project → Settings → API

const SUPABASE_URL = 'https://hiuzfhgcomrdalrqyzoz.supabase.co'; // Replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdXpmaGdjb21yZGFscnF5em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzI1MDksImV4cCI6MjA4MTYwODUwOX0.iow_7qj332jatI9_YcoNgT0FWxKPAKykE6UUnX_wO0s'; // Replace with your anon key

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
          joined_at,
          user:profiles(id, full_name, email, role, skills)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get user's teams
  getMyTeams: async (userId) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          joined_at,
          user:profiles(id, full_name, email, role, skills)
        )
      `)
      .eq('created_by', userId)
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
          joined_at,
          user:profiles(id, full_name, email, role, skills, interests, description)
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
    return { data, error };
  },

  // Create notification
  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
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
