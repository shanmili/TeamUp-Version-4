import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../store/useAuthStore';
import useTeamStore from '../store/useTeamStore';

export default function TeamDetails() {
  const router = useRouter();
  const { teamId } = useLocalSearchParams();
  
  const getTeamById = useTeamStore((s) => s.getTeamById);
  const updateTeam = useTeamStore((s) => s.updateTeam);
  const deleteTeam = useTeamStore((s) => s.deleteTeam);
  const removeMemberFromTeam = useTeamStore((s) => s.removeMemberFromTeam);
  
  const role = useAuthStore((s) => s.profile?.role);
  const currentUser = useAuthStore((s) => s.user);
  const isTeamLead = typeof role === 'string' && role.toLowerCase().includes('lead');
  
  const [team, setTeam] = useState(null);

  useEffect(() => {
    if (teamId) {
      const teamData = getTeamById(teamId);
      setTeam(teamData);
    }
  }, [teamId]);

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Team not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleFinishTeam = () => {
    Alert.alert(
      'Finish Team',
      'Mark this team as finished and move to archive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            updateTeam(teamId, { status: 'finished', archivedAt: new Date().toISOString() });
            Alert.alert('Success', 'Team has been finished and archived.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const handleTerminateTeam = () => {
    Alert.alert(
      'Terminate Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTeam(teamId);
            Alert.alert('Team Deleted', 'The team has been terminated.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const handleRemoveMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeMemberFromTeam(teamId, member.id);
            const updatedTeam = getTeamById(teamId);
            setTeam(updatedTeam);
            Alert.alert('Success', `${member.name} has been removed from the team.`);
          },
        },
      ]
    );
  };

  const handleViewProfile = (member) => {
    // Navigate to member profile with user data
    router.push({
      pathname: '/user-profile',
      params: {
        userData: JSON.stringify({
          id: member.id,
          name: member.name,
          email: member.email || member.id,
          role: member.role || member.userRole || 'Member',
          skills: member.skills || [],
          interests: member.interests || [],
          description: member.description || '',
          phone: member.phone || '',
          availability: member.availability || 'Available',
          joinedAt: member.joinedAt || new Date().toISOString(),
        })
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Info Card */}
        <View style={styles.teamInfoCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{team.teamName}</Text>
            <View style={[styles.statusBadge, team.status === 'finished' && styles.finishedBadge]}>
              <Text style={styles.statusText}>{team.status}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{team.description}</Text>
          
          {team.projectType && (
            <View style={styles.infoRow}>
              <Ionicons name="folder-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{team.projectType}</Text>
            </View>
          )}
          
          {team.duration && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{team.duration}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {team.members?.length || 0} / {team.teamSize || '?'} members
            </Text>
          </View>
          
          {team.skills && team.skills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.sectionLabel}>Skills Required:</Text>
              <View style={styles.skillsContainer}>
                {team.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members ({team.members?.length || 0})</Text>
          
          {team.members && team.members.length > 0 ? (
            team.members.map((member, index) => (
              <TouchableOpacity
                key={member.id || index}
                style={styles.memberCard}
                onPress={() => handleViewProfile(member)}
                activeOpacity={0.7}
              >
                <View style={styles.memberInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberJoined}>
                      Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.memberActions}>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                  
                  {isTeamLead && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF5252" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No members yet</Text>
            </View>
          )}
        </View>

        {/* Team Actions (Only for Team Leads) */}
        {isTeamLead && team.status === 'active' && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Team Actions</Text>
            
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={handleFinishTeam}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.finishButtonText}>Mark as Finished</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.terminateButton}
              onPress={handleTerminateTeam}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.terminateButtonText}>Terminate Team</Text>
            </TouchableOpacity>
          </View>
        )}

        {team.status === 'finished' && (
          <View style={styles.archivedNotice}>
            <Ionicons name="archive-outline" size={24} color="#666" />
            <Text style={styles.archivedText}>
              This team has been archived on {new Date(team.archivedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  teamInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  finishedBadge: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  skillsSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberJoined: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  terminateButton: {
    backgroundColor: '#FF5252',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  terminateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  archivedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  archivedText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
