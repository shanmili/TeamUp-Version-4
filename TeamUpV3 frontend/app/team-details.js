import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaveRequestHelpers, notificationHelpers } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useMessageStore from '../store/useMessageStore';
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
  const { startConversation } = useMessageStore();
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messagingMemberId, setMessagingMemberId] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [pendingLeaveRequest, setPendingLeaveRequest] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Check if current user is the creator of THIS team (not just if they have lead role)
  const isTeamCreator = team?.createdBy === currentUser?.id;
  // Check if current user is a member (not creator)
  const isMember = team?.members?.some(m => m.id === currentUser?.id);

  const loadTeam = useCallback(async () => {
    if (teamId) {
      try {
        const teamData = await getTeamById(teamId);
        console.log('Loaded team data:', teamData);
        setTeam(teamData);
        
        // Load leave requests if team creator
        if (teamData?.createdBy === currentUser?.id) {
          const { data } = await leaveRequestHelpers.getTeamLeaveRequests(teamId);
          setLeaveRequests(data || []);
        }
        
        // Check if current user has a pending leave request
        if (currentUser?.id && !teamData?.createdBy === currentUser?.id) {
          const { data } = await leaveRequestHelpers.getUserLeaveRequest(teamId, currentUser.id);
          setPendingLeaveRequest(data);
        }
      } catch (error) {
        console.error('Error loading team:', error);
        Alert.alert('Error', 'Failed to load team details');
      }
    }
  }, [teamId, getTeamById, currentUser?.id]);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadTeam();
      setLoading(false);
    };
    initLoad();
  }, [loadTeam]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeam();
    setRefreshing(false);
  }, [loadTeam]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading team details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          onPress: async () => {
            const result = await updateTeam(teamId, { status: 'finished', archivedAt: new Date().toISOString() });
            if (result.success) {
              Alert.alert('Success', 'Team has been finished and archived.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } else {
              Alert.alert('Error', result.error || 'Failed to finish team');
            }
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
          onPress: async () => {
            const result = await deleteTeam(teamId);
            if (result.success) {
              Alert.alert('Team Deleted', 'The team has been terminated.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } else {
              Alert.alert('Error', result.error || 'Failed to delete team');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (member) => {
    const memberName = member.name || member.full_name || 'this member';
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeMemberFromTeam(teamId, member.id);
            if (result.success) {
              const updatedTeam = await getTeamById(teamId);
              setTeam(updatedTeam);
              Alert.alert('Success', `${memberName} has been removed from the team.`);
            } else {
              Alert.alert('Error', result.error || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleViewProfile = (member) => {
    // Navigate to member profile - use userId to fetch from Supabase
    if (member.id) {
      router.push(`/user-profile?userId=${member.id}`);
    } else {
      // Fallback to passing user data directly
      router.push({
        pathname: '/user-profile',
        params: {
          userData: JSON.stringify({
            id: member.id,
            name: member.name || member.full_name || 'Unknown',
            email: member.email || '',
            role: member.role || 'Member',
            skills: member.skills || [],
            interests: member.interests || [],
            description: member.description || '',
            phone: member.phone || '',
            availability: member.availability || 'Available',
            joinedAt: member.joinedAt || member.joined_at || new Date().toISOString(),
          })
        }
      });
    }
  };

  const handleMessageMember = async (member) => {
    if (!currentUser?.id || !member.id || member.id === currentUser.id) return;
    
    setMessagingMemberId(member.id);
    try {
      const conversation = await startConversation(currentUser.id, member.id);
      if (conversation) {
        router.push({
          pathname: '/chat',
          params: {
            conversationId: conversation.id,
            otherUserId: member.id,
            otherUserName: member.name || member.full_name || 'Unknown',
          },
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    } finally {
      setMessagingMemberId(null);
    }
  };

  const handleOpenGroupChat = () => {
    router.push({
      pathname: '/group-chat',
      params: {
        teamId: team.id,
        teamName: team.teamName,
      },
    });
  };

  const handleRequestLeave = async () => {
    if (!leaveReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for leaving the team.');
      return;
    }
    
    setSubmittingLeave(true);
    try {
      const { data, error } = await leaveRequestHelpers.createLeaveRequest(teamId, currentUser.id, leaveReason);
      
      if (error) {
        Alert.alert('Error', 'Failed to submit leave request. You may already have a pending request.');
        return;
      }
      
      // Notify team lead
      await notificationHelpers.createNotification({
        type: 'leave_request',
        title: 'Leave Request',
        message: `${useAuthStore.getState().profile?.name || 'A member'} has requested to leave your team "${team.teamName}"`,
        teamId: team.id,
        teamName: team.teamName,
        recipientId: team.createdBy,
        senderId: currentUser.id,
        senderName: useAuthStore.getState().profile?.name,
        metadata: { leave_request_id: data.id, reason: leaveReason },
      });
      
      setPendingLeaveRequest(data);
      setShowLeaveModal(false);
      setLeaveReason('');
      Alert.alert('Request Submitted', 'Your leave request has been sent to the team lead for approval.');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Alert.alert('Error', 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCancelLeaveRequest = async () => {
    if (!pendingLeaveRequest) return;
    
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel your leave request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              await leaveRequestHelpers.cancelLeaveRequest(pendingLeaveRequest.id);
              setPendingLeaveRequest(null);
              Alert.alert('Cancelled', 'Your leave request has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel leave request');
            }
          },
        },
      ]
    );
  };

  const handleApproveLeave = async (request) => {
    Alert.alert(
      'Approve Leave',
      `Are you sure you want to approve ${request.user?.full_name || 'this member'}'s request to leave?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const result = await leaveRequestHelpers.approveLeaveRequest(request.id, request.teamId, request.userId);
              
              if (result.success) {
                // Notify the user
                await notificationHelpers.createNotification({
                  type: 'leave_approved',
                  title: 'Leave Request Approved',
                  message: `Your request to leave "${team.teamName}" has been approved.`,
                  teamId: team.id,
                  teamName: team.teamName,
                  recipientId: request.userId,
                  senderId: currentUser.id,
                });
                
                // Refresh the team data
                await loadTeam();
                Alert.alert('Approved', 'The member has been removed from the team.');
              } else {
                Alert.alert('Error', 'Failed to approve leave request');
              }
            } catch (error) {
              console.error('Error approving leave:', error);
              Alert.alert('Error', 'Failed to approve leave request');
            }
          },
        },
      ]
    );
  };

  const handleRejectLeave = async (request) => {
    Alert.alert(
      'Reject Leave',
      `Are you sure you want to reject ${request.user?.full_name || 'this member'}'s request to leave?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await leaveRequestHelpers.rejectLeaveRequest(request.id);
              
              if (result.success) {
                // Notify the user
                await notificationHelpers.createNotification({
                  type: 'leave_rejected',
                  title: 'Leave Request Rejected',
                  message: `Your request to leave "${team.teamName}" has been rejected by the team lead.`,
                  teamId: team.id,
                  teamName: team.teamName,
                  recipientId: request.userId,
                  senderId: currentUser.id,
                });
                
                // Refresh leave requests
                const { data } = await leaveRequestHelpers.getTeamLeaveRequests(teamId);
                setLeaveRequests(data || []);
                Alert.alert('Rejected', 'The leave request has been rejected.');
              } else {
                Alert.alert('Error', 'Failed to reject leave request');
              }
            } catch (error) {
              console.error('Error rejecting leave:', error);
              Alert.alert('Error', 'Failed to reject leave request');
            }
          },
        },
      ]
    );
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

          {/* Team Lead Info */}
          {team.createdByProfile && (
            <TouchableOpacity 
              style={styles.teamLeadRow}
              onPress={() => router.push(`/user-profile?userId=${team.createdBy}`)}
            >
              <View style={styles.teamLeadAvatar}>
                <Text style={styles.teamLeadAvatarText}>
                  {team.createdByProfile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </Text>
              </View>
              <View style={styles.teamLeadInfo}>
                <Text style={styles.teamLeadLabel}>Team Lead</Text>
                <Text style={styles.teamLeadName}>{team.createdByProfile.name || 'Unknown'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
          
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

        {/* Group Chat Button - Show for team creator and members */}
        {(isTeamCreator || isMember) && team.status !== 'finished' && (
          <TouchableOpacity 
            style={styles.groupChatButton}
            onPress={handleOpenGroupChat}
          >
            <View style={styles.groupChatIcon}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <View style={styles.groupChatInfo}>
              <Text style={styles.groupChatTitle}>Team Group Chat</Text>
              <Text style={styles.groupChatSubtitle}>Chat with all team members</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6366f1" />
          </TouchableOpacity>
        )}

        {/* Leave Requests Section - Only for Team Creator */}
        {isTeamCreator && leaveRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="exit-outline" size={18} color="#f59e0b" /> Leave Requests ({leaveRequests.length})
            </Text>
            {leaveRequests.map((request) => (
              <View key={request.id} style={styles.leaveRequestCard}>
                <View style={styles.leaveRequestInfo}>
                  <View style={styles.leaveRequestAvatar}>
                    <Text style={styles.leaveRequestAvatarText}>
                      {(request.user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.leaveRequestDetails}>
                    <Text style={styles.leaveRequestName}>{request.user?.full_name || 'Unknown'}</Text>
                    <Text style={styles.leaveRequestReason} numberOfLines={2}>
                      Reason: {request.reason || 'No reason provided'}
                    </Text>
                    <Text style={styles.leaveRequestDate}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.leaveRequestActions}>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => handleApproveLeave(request)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectLeave(request)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
                      {(member.name || member.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name || member.full_name || 'Unknown'}</Text>
                    <Text style={styles.memberJoined}>
                      Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.memberActions}>
                  {/* Message button - don't show for self */}
                  {member.id !== currentUser?.id && (
                    <TouchableOpacity 
                      style={styles.messageButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleMessageMember(member);
                      }}
                      disabled={messagingMemberId === member.id}
                    >
                      <Ionicons 
                        name="chatbubble-outline" 
                        size={18} 
                        color={messagingMemberId === member.id ? "#ccc" : "#007AFF"} 
                      />
                    </TouchableOpacity>
                  )}
                  
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                  
                  {isTeamCreator && (
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

        {/* Team Actions (Only for Team Creator) */}
        {isTeamCreator && team.status !== 'finished' && (
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

        {/* Member Leave Request Section - Only for members (not creator) */}
        {isMember && !isTeamCreator && team.status !== 'finished' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Membership</Text>
            
            {pendingLeaveRequest ? (
              <View style={styles.pendingLeaveCard}>
                <View style={styles.pendingLeaveInfo}>
                  <Ionicons name="time-outline" size={24} color="#f59e0b" />
                  <View style={styles.pendingLeaveText}>
                    <Text style={styles.pendingLeaveTitle}>Leave Request Pending</Text>
                    <Text style={styles.pendingLeaveSubtitle}>
                      Waiting for team lead approval
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.cancelLeaveButton}
                  onPress={handleCancelLeaveRequest}
                >
                  <Text style={styles.cancelLeaveButtonText}>Cancel Request</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.requestLeaveButton}
                onPress={() => setShowLeaveModal(true)}
              >
                <Ionicons name="exit-outline" size={20} color="#dc2626" />
                <Text style={styles.requestLeaveButtonText}>Request to Leave Team</Text>
              </TouchableOpacity>
            )}
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

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request to Leave Team</Text>
            <Text style={styles.modalSubtitle}>
              Your request will be sent to the team lead for approval.
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Please provide a reason for leaving..."
              value={leaveReason}
              onChangeText={setLeaveReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowLeaveModal(false);
                  setLeaveReason('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitButton, submittingLeave && styles.modalSubmitButtonDisabled]}
                onPress={handleRequestLeave}
                disabled={submittingLeave}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {submittingLeave ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  teamLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  teamLeadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamLeadAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  teamLeadInfo: {
    flex: 1,
  },
  teamLeadLabel: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  teamLeadName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
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
  messageButton: {
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
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
  loadingText: {
    fontSize: 16,
    color: '#999',
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
  // Group Chat Button Styles
  groupChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  groupChatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupChatInfo: {
    flex: 1,
  },
  groupChatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  groupChatSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  // Leave Request Card Styles
  leaveRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  leaveRequestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveRequestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaveRequestAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  leaveRequestDetails: {
    flex: 1,
  },
  leaveRequestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  leaveRequestReason: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  leaveRequestDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  leaveRequestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Member Leave Request Styles
  pendingLeaveCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  pendingLeaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingLeaveText: {
    marginLeft: 12,
  },
  pendingLeaveTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  pendingLeaveSubtitle: {
    fontSize: 13,
    color: '#a16207',
    marginTop: 2,
  },
  cancelLeaveButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  cancelLeaveButtonText: {
    color: '#92400e',
    fontWeight: '600',
  },
  requestLeaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  requestLeaveButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 15,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#dc2626',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
