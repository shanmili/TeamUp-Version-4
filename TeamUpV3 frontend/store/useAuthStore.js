import { create } from 'zustand';

// Simple auth store for sign in / sign up flow
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  profile: {
    skills: [],
    interests: [],
    role: null,
  },

  // setters
  signIn: (user, token) => set({ user, token, isAuthenticated: true }),
  signUp: (user, token) => set({ user, token, isAuthenticated: true }),
  signOut: () => set({ user: null, token: null, isAuthenticated: false }),

  // profile setup setters
  setProfileSkills: (skills) => set((s) => ({ profile: { ...s.profile, skills } })),
  setProfileInterests: (interests) => set((s) => ({ profile: { ...s.profile, interests } })),
  setProfileRole: (role) => set((s) => ({ profile: { ...s.profile, role } })),
  setProfile: (profile) => set({ profile }),

  // getters
  getUser: () => get().user,
  getToken: () => get().token,
  getProfile: () => get().profile,
}));

export default useAuthStore;
