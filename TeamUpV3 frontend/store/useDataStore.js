import { create } from 'zustand';

// Central data store for projects, members, messages and profile stats.
// load* functions are placeholders where you can plug real API calls.
const useDataStore = create((set, get) => ({
  projects: [],
  students: [],
  messages: [],
  profileStats: {},

  // setters
  setProjects: (projects) => set({ projects }),
  setStudents: (students) => set({ students }),
  setMessages: (messages) => set({ messages }),
  setProfileStats: (profileStats) => set({ profileStats }),

  // loaders (async placeholders)
  loadProjects: async () => {
    // Replace with API call; currently no-op to avoid prefilling data
    return get().projects;
  },
  loadStudents: async () => {
    return get().students;
  },
  loadMessages: async () => {
    return get().messages;
  },
  loadProfileStats: async () => {
    return get().profileStats;
  },

  // Dev helper: populate sample data (call only during development)
  populateSampleData: () => set({
    projects: [
      { title: 'AI Study Group', members: 4, dueDate: 'Nov 30', tags: ['Python', 'ML'], match: 92 },
      { title: 'Mobile App', members: 3, dueDate: 'Dec 10', tags: ['React Native', 'UI'], match: 85 },
    ],
    students: [
      { name: 'Alice', major: 'CS', year: 'Senior', skills: ['React', 'Node'], match: 90 },
      { name: 'Bob', major: 'Design', year: 'Junior', skills: ['Figma', 'UX'], match: 75 },
    ],
    messages: [
      { id: 1, user: 'Alice', text: 'Hey, are you joining the meeting?', time: '2h' },
      { id: 2, user: 'Bob', text: 'I pushed the repo changes.', time: '1d' },
    ],
    profileStats: { projects: 3, matches: 5 },
  }),
}));

export default useDataStore;
