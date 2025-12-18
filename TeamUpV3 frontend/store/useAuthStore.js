import { create } from 'zustand';
import { authHelpers, profileHelpers } from '../lib/supabase';

// Auth store integrated with Supabase
const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: false,
  profile: {
    name: '',
    skills: [],
    interests: [],
    role: null,
  },

  // Initialize auth state from Supabase session
  initializeAuth: async () => {
    try {
      set({ loading: true });
      const { session } = await authHelpers.getSession();
      
      if (session?.user) {
        // Fetch profile data
        const { data: profileData } = await profileHelpers.getProfile(session.user.id);
        
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          profile: {
            id: session.user.id,
            name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email,
            email: session.user.email,
            skills: profileData?.skills || [],
            interests: profileData?.interests || [],
            role: profileData?.role || null,
            description: profileData?.description || '',
            phone: profileData?.phone || '',
            availability: profileData?.availability || 'Available',
            avatar_url: profileData?.avatar_url || null,
          },
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      set({ loading: false });
    }
  },

  // Sign In with Supabase
  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) throw error;

      // Fetch profile
      const { data: profileData } = await profileHelpers.getProfile(data.user.id);
      
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        profile: {
          id: data.user.id,
          name: profileData?.full_name || data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          skills: profileData?.skills || [],
          interests: profileData?.interests || [],
          role: profileData?.role || null,
          description: profileData?.description || '',
          phone: profileData?.phone || '',
          availability: profileData?.availability || 'Available',
          avatar_url: profileData?.avatar_url || null,
        },
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign Up with Supabase
  signUp: async (email, password, fullName) => {
    try {
      set({ loading: true });
      const { data, error } = await authHelpers.signUp(email, password, fullName);
      
      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        profile: {
          id: data.user?.id,
          name: fullName || data.user?.user_metadata?.full_name || email,
          email: email,
          skills: [],
          interests: [],
          role: null,
        },
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      await authHelpers.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        profile: {
          name: '',
          skills: [],
          interests: [],
          role: null,
        },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update profile in Supabase
  updateProfile: async (updates) => {
    try {
      const userId = get().user?.id;
      if (!userId) throw new Error('No user logged in');

      const { data, error } = await profileHelpers.updateProfile(userId, updates);
      if (error) throw error;

      set((state) => ({
        profile: {
          ...state.profile,
          ...updates,
          name: updates.full_name || state.profile.name,
        },
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Profile setup setters (also update Supabase)
  setProfileSkills: async (skills) => {
    set((s) => ({ profile: { ...s.profile, skills } }));
    const userId = get().user?.id;
    if (userId) {
      await profileHelpers.updateProfile(userId, { skills });
    }
  },

  setProfileInterests: async (interests) => {
    set((s) => ({ profile: { ...s.profile, interests } }));
    const userId = get().user?.id;
    if (userId) {
      await profileHelpers.updateProfile(userId, { interests });
    }
  },

  setProfileRole: async (role) => {
    set((s) => ({ profile: { ...s.profile, role } }));
    const userId = get().user?.id;
    if (userId) {
      await profileHelpers.updateProfile(userId, { role });
    }
  },

  setProfile: async (profile) => {
    set({ profile });
    const userId = get().user?.id;
    if (userId) {
      await profileHelpers.updateProfile(userId, {
        full_name: profile.name,
        skills: profile.skills,
        interests: profile.interests,
        role: profile.role,
        description: profile.description,
        phone: profile.phone,
        availability: profile.availability,
      });
    }
  },

  // getters
  getUser: () => get().user,
  getSession: () => get().session,
  getProfile: () => get().profile,
}));

export default useAuthStore;
