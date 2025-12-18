import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { messageHelpers } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';
import useMessageStore from '../../store/useMessageStore';

export default function Messages() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, loading, fetchConversations } = useMessageStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user?.id]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!user?.id) return;

    const subscription = messageHelpers.subscribeToConversations(user.id, () => {
      fetchConversations(user.id);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchConversations(user.id);
    setRefreshing(false);
  }, [user?.id]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationPress = (conversation) => {
    router.push({
      pathname: '/chat',
      params: {
        conversationId: conversation.id,
        otherUserId: conversation.otherUser?.id,
        otherUserName: conversation.otherUser?.full_name,
      },
    });
  };

  const renderConversation = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.otherUser?.avatar_url ? (
            <Image source={{ uri: item.otherUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.otherUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {hasUnread && <View style={styles.unreadBadge} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]} numberOfLines={1}>
              {item.otherUser?.full_name || 'Unknown User'}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.lastMessage?.createdAt || item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[styles.lastMessage, hasUnread && styles.unreadText]} 
              numberOfLines={1}
            >
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadCount}>
                <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          
          {item.otherUser?.role && (
            <Text style={styles.roleText}>{item.otherUser.role}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start messaging team members from the Teams tab or by viewing their profiles.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  listContent: {
    padding: 0,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  unreadConversation: {
    backgroundColor: '#F0F7FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadCount: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  roleText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 84,
  },
});
