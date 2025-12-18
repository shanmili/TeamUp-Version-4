import { create } from 'zustand';

const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  myTeams: [],
  archivedTeams: [],
  loading: false,
  error: null,

  // Create a new team
  createTeam: (teamData) => {
    const newTeam = {
      id: Date.now().toString(),
      ...teamData,
      createdAt: new Date().toISOString(),
      members: [],
      status: 'active',
      skills: teamData.requiredSkills 
        ? teamData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    set((state) => ({
      teams: [...state.teams, newTeam],
      myTeams: [...state.myTeams, newTeam],
    }));

    return newTeam;
  },

  // Get all teams
  getAllTeams: () => {
    return get().teams;
  },

  // Get teams created by current user
  getMyTeams: () => {
    return get().myTeams;
  },

  // Get team by ID
  getTeamById: (teamId) => {
    return get().teams.find(team => team.id === teamId);
  },

  // Update team
  updateTeam: (teamId, updates) => {
    set((state) => {
      const updatedTeam = { ...updates, updatedAt: new Date().toISOString() };
      
      // If team is being finished/archived, move it to archived teams
      if (updates.status === 'finished' && !updates.archivedAt) {
        updatedTeam.archivedAt = new Date().toISOString();
      }
      
      // Check if team should be archived
      const shouldArchive = updates.status === 'finished' || updates.archivedAt;
      
      if (shouldArchive) {
        const teamToArchive = state.teams.find(t => t.id === teamId);
        if (teamToArchive) {
          return {
            teams: state.teams.filter(team => team.id !== teamId),
            myTeams: state.myTeams.filter(team => team.id !== teamId),
            archivedTeams: [...state.archivedTeams, { ...teamToArchive, ...updatedTeam }],
          };
        }
      }
      
      return {
        teams: state.teams.map(team =>
          team.id === teamId ? { ...team, ...updatedTeam } : team
        ),
        myTeams: state.myTeams.map(team =>
          team.id === teamId ? { ...team, ...updatedTeam } : team
        ),
      };
    });
  },

  // Delete team
  deleteTeam: (teamId) => {
    set((state) => ({
      teams: state.teams.filter(team => team.id !== teamId),
      myTeams: state.myTeams.filter(team => team.id !== teamId),
    }));
  },

  // Add member to team
  addMemberToTeam: (teamId, member) => {
    set((state) => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? { ...team, members: [...(team.members || []), member] }
          : team
      ),
      myTeams: state.myTeams.map(team =>
        team.id === teamId
          ? { ...team, members: [...(team.members || []), member] }
          : team
      ),
    }));
  },

  // Remove member from team
  removeMemberFromTeam: (teamId, memberId) => {
    set((state) => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      ),
      myTeams: state.myTeams.map(team =>
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      ),
    }));
  },

  // Search teams
  searchTeams: (query) => {
    const allTeams = get().teams;
    if (!query.trim()) return allTeams;

    const lowerQuery = query.toLowerCase();
    return allTeams.filter(team =>
      team.teamName?.toLowerCase().includes(lowerQuery) ||
      team.description?.toLowerCase().includes(lowerQuery) ||
      team.projectType?.toLowerCase().includes(lowerQuery) ||
      team.skills?.some(skill => skill.toLowerCase().includes(lowerQuery))
    );
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Populate sample teams (for testing)
  populateSampleTeams: () => {
    const sampleTeams = [
      {
        id: '1',
        teamName: 'Web Dev Innovators',
        description: 'Building a modern e-commerce platform with cutting-edge technologies',
        projectType: 'Web Development',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        teamSize: '5',
        duration: '3 months',
        createdAt: new Date().toISOString(),
        members: [],
        status: 'active',
      },
      {
        id: '2',
        teamName: 'Mobile App Creators',
        description: 'Developing a fitness tracking app for iOS and Android',
        projectType: 'Mobile Development',
        skills: ['React Native', 'Firebase', 'UI/UX Design'],
        teamSize: '4',
        duration: '2 months',
        createdAt: new Date().toISOString(),
        members: [],
        status: 'active',
      },
      {
        id: '3',
        teamName: 'AI Research Group',
        description: 'Exploring machine learning applications in healthcare',
        projectType: 'Research',
        skills: ['Python', 'TensorFlow', 'Data Analysis'],
        teamSize: '6',
        duration: '6 months',
        createdAt: new Date().toISOString(),
        members: [],
        status: 'active',
      },
    ];

    set({ teams: sampleTeams, myTeams: [] });
  },

  // Clear all teams
  clearTeams: () => set({ teams: [], myTeams: [], archivedTeams: [] }),

  // Get archived teams
  getArchivedTeams: () => {
    return get().archivedTeams;
  },

  // Archive team directly
  archiveTeam: (teamId) => {
    set((state) => {
      const teamToArchive = state.teams.find(t => t.id === teamId);
      if (!teamToArchive) return state;

      return {
        teams: state.teams.filter(team => team.id !== teamId),
        myTeams: state.myTeams.filter(team => team.id !== teamId),
        archivedTeams: [
          ...state.archivedTeams,
          { ...teamToArchive, status: 'finished', archivedAt: new Date().toISOString() }
        ],
      };
    });
  },

  // Restore team from archive
  restoreTeam: (teamId) => {
    set((state) => {
      const teamToRestore = state.archivedTeams.find(t => t.id === teamId);
      if (!teamToRestore) return state;

      const { archivedAt, ...restoredTeam } = teamToRestore;
      return {
        archivedTeams: state.archivedTeams.filter(team => team.id !== teamId),
        teams: [...state.teams, { ...restoredTeam, status: 'active' }],
      };
    });
  },

  // Auto-archive teams past their deadline
  checkAndArchiveExpiredTeams: () => {
    const now = new Date();
    set((state) => {
      const teamsToArchive = [];
      const remainingTeams = [];
      const remainingMyTeams = [];

      state.teams.forEach(team => {
        // Check if team has a deadline and if it's passed
        if (team.deadline) {
          const deadline = new Date(team.deadline);
          if (deadline < now) {
            teamsToArchive.push({
              ...team,
              status: 'finished',
              archivedAt: new Date().toISOString(),
            });
          } else {
            remainingTeams.push(team);
          }
        } else {
          remainingTeams.push(team);
        }
      });

      state.myTeams.forEach(team => {
        if (!team.deadline || new Date(team.deadline) >= now) {
          remainingMyTeams.push(team);
        }
      });

      return {
        teams: remainingTeams,
        myTeams: remainingMyTeams,
        archivedTeams: [...state.archivedTeams, ...teamsToArchive],
      };
    });
  },
}));

export default useTeamStore;
