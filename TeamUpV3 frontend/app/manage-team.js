import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import useTeamStore from '../store/useTeamStore';

export default function ManageTeam() {
  const router = useRouter();
  const role = useAuthStore((s) => s.profile?.role);
  const user = useAuthStore((s) => s.user);
  const isTeamLead = typeof role === 'string' && role.toLowerCase().includes('lead');

  const myTeams = useTeamStore((s) => s.myTeams);
  const loadMyTeams = useTeamStore((s) => s.loadMyTeams);
  const addMemberToTeam = useTeamStore((s) => s.addMemberToTeam);
  const notifications = useNotificationStore((s) => s.notifications);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);

  // Filter join request notifications
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const joinRequests = notifications.filter(n => n.type === 'join_request');
    setPendingRequests(joinRequests);
  }, [notifications]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      await loadMyTeams(user.id);
      await loadNotifications(user.id);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  if (!isTeamLead) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Team</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.deniedTitle}>Not authorized</Text>
          <Text style={styles.deniedText}>This area is reserved for team leads.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleApprove = (request) => {
    Alert.alert(
      'Approve Request',
      `Add ${request.senderName || 'this user'} to your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            // Add member to the team
            const newMember = {
              id: request.senderId,
              name: request.senderName,
              role: request.senderRole,
              joinedAt: new Date().toISOString(),
            };
            
            const result = await addMemberToTeam(request.teamId, newMember);
            
            if (result?.success) {
              // Remove notification
              await deleteNotification(request.id);
              Alert.alert('Success', `${request.senderName || 'User'} has been added to your team!`);
            } else {
              Alert.alert('Error', result?.error || 'Failed to add member to team');
            }
          },
        },
      ]
    );
  };

  const handleReject = (request) => {
    Alert.alert(
      'Reject Request',
      `Reject ${request.senderName || 'this user'}'s request to join?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(request.id);
            Alert.alert('Request Rejected', `${request.senderName || 'User'}'s request has been rejected.`);
          },
        },
      ]
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Team Management</Text>
            <Text style={styles.subtitle}>{pendingRequests.length} pending member requests</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests */}
        <View style={styles.requestsContainer}>
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              {/* Header with name and time */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarText}>
                    {(request.senderName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{request.senderName || 'Unknown User'}</Text>
                  <Text style={styles.roleText}>{request.senderRole || 'No role specified'}</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.time}>{getTimeAgo(request.createdAt)}</Text>
                </View>
              </View>

              {/* Project applying for */}
              <Text style={styles.project}>Applying for: {request.teamName}</Text>

              {/* Message */}
              <Text style={styles.message}>{request.message}</Text>

              {/* View Profile Button */}
              <TouchableOpacity 
                style={styles.viewProfileButton}
                onPress={() => {
                  // Navigate to user profile with sender ID
                  router.push(`/user-profile?userId=${request.senderId}`);
                }}
              >
                <Text style={styles.viewProfileText}>👤 View Full Profile</Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.approveButton}
                  onPress={() => handleApprove(request)}
                >
                  <Text style={styles.approveButtonText}>✓ Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleReject(request)}
                >
                  <Text style={styles.rejectButtonText}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {pendingRequests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubText}>Member requests will appear here</Text>
            </View>
          )}
        </View>

        {/* Team Overview Section */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Your Teams</Text>
          {myTeams.map((team) => (
            <TouchableOpacity 
              key={team.id} 
              style={styles.teamCard}
              onPress={() => router.push(`/team-details?teamId=${team.id}`)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{team.teamName}</Text>
                <Text style={styles.teamMembers}>
                  {team.members?.length || 0} / {team.teamSize || '?'} members
                </Text>
              </View>
              <Text style={{ color: '#007AFF', fontSize: 14 }}>View →</Text>
            </TouchableOpacity>
          ))}
          {myTeams.length === 0 && (
            <Text style={styles.emptyTeamText}>No teams created yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  backLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  requestsContainer: {
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  project: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewProfileButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewProfileText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  teamSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  teamCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamMembers: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyTeamText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  deniedText: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
