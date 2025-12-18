import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileHelpers } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useMessageStore from '../store/useMessageStore';

export default function UserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const { user } = useAuthStore();
  const { startConversation } = useMessageStore();
  
  // Check if this is the current user's own profile
  const isOwnProfile = user?.id === params.userId || user?.id === userData?.id;
  
  // Load user profile from Supabase if userId is provided
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // If userData is passed directly as JSON
        if (params.userData) {
          setUserData(JSON.parse(params.userData));
          setLoading(false);
          return;
        }
        
        // If userId is provided, fetch from Supabase
        if (params.userId) {
          const { data, error } = await profileHelpers.getProfile(params.userId);
          
          if (data && !error) {
            setUserData({
              id: data.id,
              name: data.full_name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              skills: data.skills || [],
              interests: data.interests || [],
              availability: data.availability,
              description: data.description,
              avatar_url: data.avatar_url,
              createdAt: data.created_at,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [params.userId, params.userData]);

  const handleMessage = async () => {
    if (!user?.id || !userData?.id || isOwnProfile) return;
    
    setMessagingLoading(true);
    try {
      const conversation = await startConversation(user.id, userData.id);
      if (conversation) {
        router.push({
          pathname: '/chat',
          params: {
            conversationId: conversation.id,
            otherUserId: userData.id,
            otherUserName: userData.name,
          },
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setMessagingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <Text style={styles.errorText}>User profile not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </Text>
          </View>
          
          <Text style={styles.userName}>{userData.name || 'Unknown User'}</Text>
          
          {userData.role && (
            <View style={styles.roleBadge}>
              <Ionicons name="briefcase-outline" size={14} color="#007AFF" />
              <Text style={styles.roleText}>{userData.role}</Text>
            </View>
          )}

          {userData.description && (
            <Text style={styles.description}>{userData.description}</Text>
          )}

          {/* Message Button - only show if not own profile */}
          {!isOwnProfile && (
            <TouchableOpacity 
              style={styles.messageButton} 
              onPress={handleMessage}
              disabled={messagingLoading}
            >
              {messagingLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Information */}
        {(userData.email || userData.phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.card}>
              {userData.email && (
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <Text style={styles.contactText}>{userData.email}</Text>
                </View>
              )}
              {userData.phone && (
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.contactText}>{userData.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Skills */}
        {userData.skills && userData.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.card}>
              <View style={styles.chipsContainer}>
                {userData.skills.map((skill, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Interests */}
        {userData.interests && userData.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.card}>
              <View style={styles.chipsContainer}>
                {userData.interests.map((interest, index) => (
                  <View key={index} style={[styles.chip, styles.interestChip]}>
                    <Text style={[styles.chipText, styles.interestChipText]}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Availability */}
        {userData.availability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.card}>
              <View style={styles.availabilityRow}>
                <Ionicons 
                  name={userData.availability === 'Available' ? "checkmark-circle" : "time-outline"} 
                  size={20} 
                  color={userData.availability === 'Available' ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={[
                  styles.availabilityText,
                  userData.availability === 'Available' ? styles.available : styles.busy
                ]}>
                  {userData.availability}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Additional Info */}
        {userData.joinedAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Since</Text>
            <View style={styles.card}>
              <Text style={styles.infoText}>
                {new Date(userData.joinedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
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
  },
  profileHeader: {
    backgroundColor: '#FFF',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
  interestChip: {
    backgroundColor: '#F3E5F5',
  },
  interestChipText: {
    color: '#7B1FA2',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityText: {
    fontSize: 15,
    fontWeight: '600',
  },
  available: {
    color: '#4CAF50',
  },
  busy: {
    color: '#FF9800',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
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
