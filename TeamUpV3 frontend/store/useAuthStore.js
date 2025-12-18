import { create } from 'zustand';
import { authHelpers, profileHelpers, supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  // Sign up with email/password (no email confirmation required)
  signUp: async (email, password, fullName) => {
    try {
      set({ loading: true });
      
      // Sign up with Supabase
      const { data, error } = await authHelpers.signUp(email, password, fullName);
      
      if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }

      // Check if user was created and session exists
      if (data?.user && data?.session) {
        // Create or update profile in database (upsert to handle existing profiles)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: '',
            skills: [],
            interests: [],
            availability: 'Available',
          }, { onConflict: 'id' });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway - profile might already exist
        }

        // User is automatically signed in (email confirmation disabled)
        set({ 
          user: data.user, 
          session: data.session,
          profile: {
            id: data.user.id,
            name: fullName,
            email: email,
            skills: [],
            interests: [],
            role: '',
            availability: 'Available',
          },
          loading: false 
        });
        return { success: true, emailConfirmationRequired: false };
      } else if (data?.user && !data?.session) {
        // Email confirmation is required
        set({ loading: false });
        return { success: true, emailConfirmationRequired: true };
      } else {
        set({ loading: false });
        return { success: false, error: 'Unknown error during sign up' };
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    try {
      set({ loading: true });
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        set({ loading: false });
        return { success: false, error: error.message };
      }

      if (data?.user && data?.session) {
        // Load profile from database
        const { data: profileData, error: profileError } = await profileHelpers.getProfile(data.user.id);
        
        let profile;
        if (profileData && !profileError) {
          // Use saved profile from database
          profile = {
            id: profileData.id,
            name: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone || '',
            skills: profileData.skills || [],
            interests: profileData.interests || [],
            role: profileData.role || '',
            availability: profileData.availability || 'Available',
            description: profileData.description || '',
            avatar_url: profileData.avatar_url || null,
          };
        } else {
          // Fallback to basic profile from auth
          profile = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email,
            email: data.user.email,
            skills: [],
            interests: [],
            role: '',
            availability: 'Available',
          };
        }

        set({ 
          user: data.user, 
          session: data.session,
          profile: profile,
          loading: false 
        });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Sign in exception:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await authHelpers.signOut();
      set({ user: null, session: null, profile: null });
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize auth state
  initializeAuth: async () => {
    try {
      const { session, error } = await authHelpers.getSession();
      
      if (session?.user) {
        // Load profile from database
        const { data: profileData, error: profileError } = await profileHelpers.getProfile(session.user.id);
        
        let profile;
        if (profileData && !profileError) {
          // Use saved profile from database
          profile = {
            id: profileData.id,
            name: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone || '',
            skills: profileData.skills || [],
            interests: profileData.interests || [],
            role: profileData.role || '',
            availability: profileData.availability || 'Available',
            description: profileData.description || '',
            avatar_url: profileData.avatar_url || null,
          };
        } else {
          // Fallback to basic profile from auth
          profile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email,
            email: session.user.email,
            skills: [],
            interests: [],
            role: '',
            availability: 'Available',
          };
        }

        set({ 
          user: session.user,
          session: session,
          profile: profile,
          initialized: true 
        });
      } else {
        set({ user: null, session: null, profile: null, initialized: true });
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      set({ initialized: true });
    }
  },

  // Profile management - saves to Supabase
  setProfile: async (profile) => {
    const state = get();
    if (!state.user?.id) return;
    
    // Update local state immediately
    set({ profile });
    
    // Save to Supabase
    try {
      await profileHelpers.updateProfile(state.user.id, {
        full_name: profile.name,
        email: profile.email,
        phone: profile.phone,
        skills: profile.skills || [],
        interests: profile.interests || [],
        role: profile.role,
        availability: profile.availability,
        description: profile.description,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save profile to Supabase:', error);
    }
  },
  
  setProfileSkills: async (skills) => {
    const state = get();
    const newProfile = { ...state.profile, skills };
    set({ profile: newProfile });
    
    // Save to Supabase
    if (state.user?.id) {
      try {
        await profileHelpers.updateProfile(state.user.id, { 
          skills, 
          updated_at: new Date().toISOString() 
        });
      } catch (error) {
        console.error('Failed to save skills to Supabase:', error);
      }
    }
  },
  
  setProfileInterests: async (interests) => {
    const state = get();
    const newProfile = { ...state.profile, interests };
    set({ profile: newProfile });
    
    // Save to Supabase
    if (state.user?.id) {
      try {
        await profileHelpers.updateProfile(state.user.id, { 
          interests, 
          updated_at: new Date().toISOString() 
        });
      } catch (error) {
        console.error('Failed to save interests to Supabase:', error);
      }
    }
  },
  
  setProfileRole: async (role) => {
    const state = get();
    const newProfile = { ...state.profile, role };
    set({ profile: newProfile });
    
    // Save to Supabase
    if (state.user?.id) {
      try {
        await profileHelpers.updateProfile(state.user.id, { 
          role, 
          updated_at: new Date().toISOString() 
        });
      } catch (error) {
        console.error('Failed to save role to Supabase:', error);
      }
    }
  },
}));

export default useAuthStore;
