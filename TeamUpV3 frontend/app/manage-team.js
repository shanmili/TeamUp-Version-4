import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const addMemberToTeam = useTeamStore((s) => s.addMemberToTeam);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);

  // Filter join request notifications
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const joinRequests = notifications.filter(n => n.type === 'join_request');
    setPendingRequests(joinRequests);
  }, [notifications]);

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
      `Add ${request.userName} to your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            // Add member to the team
            const newMember = {
              id: request.userId,
              name: request.userName,
              joinedAt: new Date().toISOString(),
            };
            
            addMemberToTeam(request.teamId, newMember);
            
            // Remove notification
            deleteNotification(request.id);
            
            Alert.alert('Success', `${request.userName} has been added to your team!`);
          },
        },
      ]
    );
  };

  const handleReject = (request) => {
    Alert.alert(
      'Reject Request',
      `Reject ${request.userName}'s request to join?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            deleteNotification(request.id);
            Alert.alert('Request Rejected', `${request.userName}'s request has been rejected.`);
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
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 24 }}>
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
                <Text style={styles.name}>{request.userName}</Text>
                <View style={styles.badgeContainer}>
                  <Text style={styles.time}>{getTimeAgo(request.createdAt)}</Text>
                </View>
              </View>

              {/* Project applying for */}
              <Text style={styles.project}>Applying for: {request.teamName}</Text>

              {/* Message */}
              <Text style={styles.message}>{request.message}</Text>

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
            <View key={team.id} style={styles.teamCard}>
              <Text style={styles.teamName}>{team.teamName}</Text>
              <Text style={styles.teamMembers}>
                {team.members?.length || 0} / {team.teamSize || '?'} members
              </Text>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
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
    marginBottom: 16,
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
