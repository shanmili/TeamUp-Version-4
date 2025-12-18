import { create } from 'zustand';
import { teamHelpers } from '../lib/supabase';

// Helper function to transform team data from database (snake_case) to frontend (camelCase)
const transformTeamData = (team) => {
  if (!team) return null;
  
  return {
    id: team.id,
    teamName: team.team_name,
    description: team.description,
    projectType: team.project_type,
    teamSize: team.team_size,
    duration: team.duration,
    skills: team.skills || [],
    status: team.status,
    createdBy: team.created_by,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
    archivedAt: team.archived_at,
    startDate: team.start_date,
    endDate: team.end_date,
    maxMembers: team.max_members || team.team_size,
    // Transform members array - profiles data comes from the user_id join
    members: team.team_members?.map(tm => {
      // Handle null/undefined profiles safely
      const profile = tm?.profiles ?? {};
      return {
        id: tm?.user_id || profile?.id || null,
        name: profile?.full_name || 'Unknown',
        email: profile?.email || '',
        role: profile?.role || tm?.role || 'Member',
        skills: profile?.skills ?? [],
        interests: profile?.interests ?? [],
        description: profile?.description || '',
        phone: profile?.phone || '',
        availability: profile?.availability || 'Available',
        joinedAt: tm?.joined_at,
      };
    }).filter(m => m.id !== null) || [],
  };
};

const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  myTeams: [],
  archivedTeams: [],
  loading: false,
  error: null,

  // Load all active teams from Supabase
  loadTeams: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await teamHelpers.getAllTeams();
      
      if (error) throw error;
      
      const transformedTeams = data?.map(transformTeamData) || [];
      set({ teams: transformedTeams, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Load user's teams from Supabase
  loadMyTeams: async (userId) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await teamHelpers.getMyTeams(userId);
      
      if (error) throw error;
      
      const transformedTeams = data?.map(transformTeamData) || [];
      set({ myTeams: transformedTeams, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create a new team in Supabase
  createTeam: async (teamData, userId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await teamHelpers.createTeam({
        team_name: teamData.teamName,
        description: teamData.description,
        project_type: teamData.projectType,
        team_size: parseInt(teamData.teamSize) || null,
        duration: teamData.duration,
        skills: teamData.requiredSkills 
          ? teamData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        created_by: userId,
        status: 'active',
      });

      if (error) throw error;

      const transformedTeam = transformTeamData(data);

      // Add to local state
      set((state) => ({
        teams: [transformedTeam, ...state.teams],
        myTeams: [transformedTeam, ...state.myTeams],
        loading: false,
      }));

      return { success: true, data: transformedTeam };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
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
  getTeamById: async (teamId) => {
    try {
      const { data, error} = await teamHelpers.getTeam(teamId);
      if (error) throw error;
      return transformTeamData(data);
    } catch (error) {
      console.error('Get team error:', error);
      // Fallback to local state
      return get().teams.find(team => team.id === teamId);
    }
  },

  // Update team in Supabase
  updateTeam: async (teamId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const shouldArchive = updates.status === 'finished' || updates.archivedAt;
      
      const { data, error } = await teamHelpers.updateTeam(teamId, {
        team_name: updates.teamName,
        description: updates.description,
        status: updates.status,
        archived_at: updates.archivedAt,
        ...updates,
      });

      if (error) throw error;

      if (shouldArchive) {
        set((state) => ({
          teams: state.teams.filter(team => team.id !== teamId),
          myTeams: state.myTeams.filter(team => team.id !== teamId),
          archivedTeams: [...state.archivedTeams, data],
          loading: false,
        }));
      } else {
        set((state) => ({
          teams: state.teams.map(team =>
            team.id === teamId ? { ...team, ...data } : team
          ),
          myTeams: state.myTeams.map(team =>
            team.id === teamId ? { ...team, ...data } : team
          ),
          loading: false,
        }));
      }

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Delete team from Supabase
  deleteTeam: async (teamId) => {
    try {
      set({ loading: true, error: null });
      const { error } = await teamHelpers.deleteTeam(teamId);
      
      if (error) throw error;

      set((state) => ({
        teams: state.teams.filter(team => team.id !== teamId),
        myTeams: state.myTeams.filter(team => team.id !== teamId),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Add member to team in Supabase
  addMemberToTeam: async (teamId, member) => {
    try {
      const { data, error } = await teamHelpers.addMember(
        teamId,
        member.id || member.userId,
        member.role || 'Member'
      );

      if (error) throw error;

      const team = await get().getTeamById(teamId);
      
      set((state) => ({
        teams: state.teams.map(t =>
          t.id === teamId ? team : t
        ),
        myTeams: state.myTeams.map(t =>
          t.id === teamId ? team : t
        ),
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove member from team in Supabase
  removeMemberFromTeam: async (teamId, memberId) => {
    try {
      const { error } = await teamHelpers.removeMember(teamId, memberId);
      
      if (error) throw error;

      const team = await get().getTeamById(teamId);
      
      set((state) => ({
        teams: state.teams.map(t =>
          t.id === teamId ? team : t
        ),
        myTeams: state.myTeams.map(t =>
          t.id === teamId ? team : t
        ),
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Search teams in Supabase
  searchTeams: async (query) => {
    try {
      const { data, error } = await teamHelpers.searchTeams(query);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Populate sample teams (for testing)
  populateSampleTeams: async (userId) => {
    const sampleTeams = [
      {
        teamName: 'Web Dev Innovators',
        description: 'Building a modern e-commerce platform with cutting-edge technologies',
        projectType: 'Web Development',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        maxMembers: 5,
        status: 'in-progress',
        createdBy: userId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        teamName: 'Mobile App Creators',
        description: 'Developing a fitness tracking app for iOS and Android',
        projectType: 'Mobile Development',
        skills: ['React Native', 'Firebase', 'UI/UX Design'],
        maxMembers: 4,
        status: 'in-progress',
        createdBy: userId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        teamName: 'AI Research Group',
        description: 'Exploring machine learning applications in healthcare',
        projectType: 'Research',
        skills: ['Python', 'TensorFlow', 'Data Analysis'],
        maxMembers: 6,
        status: 'in-progress',
        createdBy: userId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const teamData of sampleTeams) {
      await get().createTeam(teamData, userId);
    }
  },

  // Clear all teams
  clearTeams: () => set({ teams: [], myTeams: [], archivedTeams: [] }),

  // Get archived teams
  getArchivedTeams: () => {
    return get().archivedTeams;
  },

  // Archive team directly
  archiveTeam: async (teamId) => {
    return get().updateTeam(teamId, {
      archivedAt: new Date().toISOString(),
      status: 'finished',
    });
  },

  // Restore team from archive
  restoreTeam: async (teamId) => {
    try {
      const { data, error } = await teamHelpers.updateTeam(teamId, {
        archived_at: null,
        status: 'in-progress',
      });

      if (error) throw error;

      set((state) => ({
        archivedTeams: state.archivedTeams.filter(team => team.id !== teamId),
        teams: [...state.teams, data],
        myTeams: data.created_by === state.currentUserId 
          ? [...state.myTeams, data]
          : state.myTeams,
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Auto-archive teams past their deadline
  checkAndArchiveExpiredTeams: async () => {
    const teams = get().teams;
    const now = new Date();

    for (const team of teams) {
      if (team.endDate && new Date(team.endDate) < now) {
        await get().archiveTeam(team.id);
      }
    }
  },
}));

export default useTeamStore;
