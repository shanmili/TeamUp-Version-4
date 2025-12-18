import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileHelpers } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';
import useMessageStore from '../../store/useMessageStore';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { startConversation } = useMessageStore();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messagingUserId, setMessagingUserId] = useState(null);

  const loadMembers = async () => {
    try {
      const { data, error } = await profileHelpers.getAllProfiles();
      if (error) {
        console.error('Error loading members:', error);
        return;
      }
      // Filter out current user
      const otherMembers = data?.filter(m => m.id !== currentUser?.id) || [];
      setMembers(otherMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadMembers();
      setLoading(false);
    };
    init();
  }, [currentUser?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  }, []);

  const handleViewProfile = (member) => {
    router.push(`/user-profile?userId=${member.id}`);
  };

  const handleMessage = async (member) => {
    if (!currentUser?.id || !member.id) return;
    
    setMessagingUserId(member.id);
    try {
      const conversation = await startConversation(currentUser.id, member.id);
      if (conversation) {
        router.push({
          pathname: '/chat',
          params: {
            conversationId: conversation.id,
            otherUserId: member.id,
            otherUserName: member.full_name,
          },
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setMessagingUserId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.sectionTitle}>Discover Members</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>Discover Members</Text>
      <Text style={styles.subtitle}>Find teammates to collaborate with</Text>
      
      {members.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No members found</Text>
          <Text style={styles.emptySubtext}>Invite classmates to join TeamUp!</Text>
        </View>
      ) : (
        members.map((member) => (
          <TouchableOpacity 
            key={member.id} 
            style={styles.memberCard}
            onPress={() => handleViewProfile(member)}
            activeOpacity={0.7}
          >
            <View style={styles.memberHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(member.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.full_name || 'Unknown'}</Text>
                {member.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{member.role}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={styles.messageBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMessage(member);
                }}
                disabled={messagingUserId === member.id}
              >
                {messagingUserId === member.id ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
            
            {member.description && (
              <Text style={styles.description} numberOfLines={2}>{member.description}</Text>
            )}
            
            {member.skills && member.skills.length > 0 && (
              <View style={styles.skillsContainer}>
                {member.skills.slice(0, 4).map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {member.skills.length > 4 && (
                  <Text style={styles.moreSkills}>+{member.skills.length - 4}</Text>
                )}
              </View>
            )}
            
            {member.interests && member.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                <Text style={styles.interestsLabel}>Interests: </Text>
                <Text style={styles.interestsText} numberOfLines={1}>
                  {member.interests.slice(0, 3).join(', ')}
                  {member.interests.length > 3 ? ` +${member.interests.length - 3}` : ''}
                </Text>
              </View>
            )}
            
            <View style={styles.memberFooter}>
              <View style={[
                styles.availabilityBadge,
                member.availability === 'Available' ? styles.available : styles.busy
              ]}>
                <View style={[
                  styles.availabilityDot,
                  member.availability === 'Available' ? styles.availableDot : styles.busyDot
                ]} />
                <Text style={styles.availabilityText}>{member.availability || 'Unknown'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
    backgroundColor: '#F5F5F5' 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 4,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  interestsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  interestsText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#E8F5E9',
  },
  busy: {
    backgroundColor: '#FFF3E0',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availableDot: {
    backgroundColor: '#4CAF50',
  },
  busyDot: {
    backgroundColor: '#FF9800',
  },
  availabilityText: {
    fontSize: 12,
    color: '#666',
  },
});
