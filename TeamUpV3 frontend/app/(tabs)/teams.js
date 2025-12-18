import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
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
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import useTeamStore from '../../store/useTeamStore';

export default function Teams() {
  const router = useRouter();
  const role = useAuthStore((s) => s.profile?.role);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isTeamLead = typeof role === 'string' && role.toLowerCase().includes('lead');
  
  const myTeams = useTeamStore((s) => s.myTeams);
  const allTeams = useTeamStore((s) => s.teams);
  const loadTeams = useTeamStore((s) => s.loadTeams);
  const loadMyTeams = useTeamStore((s) => s.loadMyTeams);
  const searchTeamsFunc = useTeamStore((s) => s.searchTeams);
  
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const subscribeToNotifications = useNotificationStore((s) => s.subscribeToNotifications);
  const unsubscribe = useNotificationStore((s) => s.unsubscribe);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appliedTeams, setAppliedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load teams and notifications on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Load teams
        await loadTeams();
        
        if (user?.id) {
          // Load user's teams
          await loadMyTeams(user.id);
          
          // Load notifications
          await loadNotifications(user.id);
          
          // Subscribe to real-time notifications
          subscribeToNotifications(user.id, (newNotification) => {
            // Optional: Show a toast or alert for new notifications
            console.log('New notification:', newNotification);
          });
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchTeamsFunc(query);
      setFilteredTeams(results || []);
    } else {
      setFilteredTeams([]);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Reload all data
      await loadTeams();
      
      if (user?.id) {
        await loadMyTeams(user.id);
        await loadNotifications(user.id);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'join_request') {
      // Navigate to manage team with member requests section
      router.push('/manage-team');
    } else if (notification.type === 'member_joined') {
      // Navigate to team details or manage team
      router.push('/manage-team');
    }
    
    // Close modal
    setShowNotifications(false);
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

  const handleJoinTeam = async (team, e) => {
    // Prevent card click event
    e?.stopPropagation();
    
    // Check if already applied
    if (appliedTeams.includes(team.id)) {
      Alert.alert('Already Applied', 'You have already applied to join this team.');
      return;
    }

    // Check if already a member
    const isMember = team.members?.some(m => m.id === user?.id || m.email === user?.email);
    if (isMember) {
      Alert.alert('Already a Member', 'You are already a member of this team.');
      return;
    }

    // Create join request notification for the team lead
    const result = await addNotification({
      type: 'join_request',
      title: 'New Join Request',
      message: `${profile?.name || user?.email || 'A user'} wants to join ${team.teamName}`,
      teamId: team.id,
      teamName: team.teamName,
      recipientId: team.createdBy, // Send to team lead
      senderId: user?.id,
      senderName: profile?.name || user?.email || 'User',
      senderRole: role || '',
    });

    if (result.success) {
      // Track that user has applied
      setAppliedTeams([...appliedTeams, team.id]);

      Alert.alert(
        'Request Sent',
        `Your request to join ${team.teamName} has been sent to the team lead.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Failed to send join request. Please try again.');
    }
  };

  const isAlreadyApplied = (teamId) => {
    return appliedTeams.includes(teamId);
  };

  const teamsToDisplay = searchQuery.trim() ? filteredTeams : (isTeamLead ? myTeams : allTeams);

  // Debug: Log the teams data
  console.log('Teams Debug:', {
    role,
    isTeamLead,
    myTeamsCount: myTeams.length,
    allTeamsCount: allTeams.length,
    teamsToDisplayCount: teamsToDisplay.length,
    myTeams,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        {isTeamLead && (
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications" size={22} color="#FFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.addBtn, { marginLeft: 12 }]}
              onPress={() => router.push('/create-team')}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or projects..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Actions row: Discover and (conditionally) Manage Team for team leads */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            router.push('/(tabs)/discover');
          }}
        >
          <Ionicons name="search-outline" size={18} color="#007AFF" />
          <Text style={styles.actionText}>Discover</Text>
        </TouchableOpacity>

        {isTeamLead && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FF5252' }]}
            onPress={() => {
              // Manage team routes are app-specific — replace with your manage route if available
              router.push('/manage-team');
            }}
          >
            <Ionicons name="settings-outline" size={18} color="#FFF" />
            <Text style={[styles.actionText, { color: '#FFF' }]}>Manage Team</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification Modal */}
      <Modal
        visible={showNotifications}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        >
          <Pressable 
            style={styles.notificationModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllRead}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.notificationUnread
                    ]}
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <View style={styles.notificationIcon}>
                      <Ionicons 
                        name={notification.type === 'join_request' ? 'person-add' : 'checkmark-circle'} 
                        size={24} 
                        color={notification.read ? '#999' : '#007AFF'} 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{getTimeAgo(notification.createdAt)}</Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Main content: Display actual teams from store */}
      <ScrollView 
        style={styles.screen} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <Text style={styles.screenTitle}>
          {isTeamLead ? 'My Teams' : 'All Teams'}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        ) : teamsToDisplay.length > 0 ? (
          teamsToDisplay.map((team) => (
            <View key={team.id} style={styles.teamCardContainer}>
              <TouchableOpacity 
                style={styles.teamCard}
                onPress={() => {
                  router.push(`/team-details?teamId=${team.id}`);
                }}
              >
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.teamName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{team.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.teamDescription} numberOfLines={2}>
                  {team.description}
                </Text>
                
                {team.projectType && (
                  <View style={styles.projectTypeContainer}>
                    <Ionicons name="folder-outline" size={14} color="#666" />
                    <Text style={styles.projectType}>{team.projectType}</Text>
                  </View>
                )}
                
                {team.skills && team.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {team.skills.slice(0, 3).map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {team.skills.length > 3 && (
                      <Text style={styles.moreSkills}>+{team.skills.length - 3} more</Text>
                    )}
                  </View>
                )}
                
                <View style={styles.teamFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.footerText}>
                      {team.members?.length || 0}/{team.teamSize || '?'} members
                    </Text>
                  </View>
                  {team.duration && (
                    <View style={styles.footerItem}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.footerText}>{team.duration}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Join button for non-team-lead users */}
              {!isTeamLead && (
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    isAlreadyApplied(team.id) && styles.appliedButton
                  ]}
                  onPress={(e) => handleJoinTeam(team, e)}
                  disabled={isAlreadyApplied(team.id)}
                >
                  <Ionicons 
                    name={isAlreadyApplied(team.id) ? "checkmark-circle" : "add-circle-outline"} 
                    size={18} 
                    color="#FFF" 
                  />
                  <Text style={styles.joinButtonText}>
                    {isAlreadyApplied(team.id) ? 'Applied' : 'Join Team'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'No teams found matching your search' 
                : isTeamLead 
                  ? 'No teams created yet' 
                  : 'No teams available'}
            </Text>
            <Text style={styles.emptySubText}>
              {isTeamLead 
                ? 'Tap the + button to create your first team' 
                : 'Use Discover to find students and projects'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// (The detailed component templates from the original design are available
// below if you want to replace skeletons with neutral templates.)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 32,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 10,
    fontSize: 15,
    color: '#000',
  },
  screen: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '700',
  },
  teamCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectType: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  moreSkills: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
    marginLeft: 4,
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#999',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FF5252',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  notificationModal: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  markAllRead: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  notificationList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'flex-start',
  },
  notificationUnread: {
    backgroundColor: '#F0F8FF',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 6,
  },
  emptyNotifications: {
    alignItems: 'center',
    padding: 40,
  },
  emptyNotificationsText: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
  },
  closeButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  appliedButton: {
    backgroundColor: '#4CAF50',
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
  },
});
