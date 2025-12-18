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
import { groupChatHelpers, messageHelpers } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';
import useMessageStore from '../../store/useMessageStore';

export default function Messages() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, loading, fetchConversations } = useMessageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'group'
  const [groupChats, setGroupChats] = useState([]);
  const [groupChatsLoading, setGroupChatsLoading] = useState(false);

  // Calculate unread counts
  const personalUnreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const loadGroupChats = useCallback(async () => {
    if (!user?.id) return;
    setGroupChatsLoading(true);
    try {
      const { data, error } = await groupChatHelpers.getUserGroupChats(user.id);
      if (data && !error) {
        setGroupChats(data);
      }
    } catch (error) {
      console.error('Error loading group chats:', error);
    } finally {
      setGroupChatsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
      loadGroupChats();
    }
  }, [user?.id, loadGroupChats]);

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
    await Promise.all([
      fetchConversations(user.id),
      loadGroupChats(),
    ]);
    setRefreshing(false);
  }, [user?.id, loadGroupChats]);

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

  const handleGroupChatPress = (groupChat) => {
    router.push({
      pathname: '/group-chat',
      params: {
        teamId: groupChat.teamId,
        teamName: groupChat.teamName,
        groupChatId: groupChat.id,
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

  const renderGroupChat = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleGroupChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarPlaceholder, styles.groupAvatar]}>
            <Ionicons name="people" size={24} color="#fff" />
          </View>
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.teamName || item.name}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.lastMessage?.createdAt || item.lastMessageAt)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage 
                ? `${item.lastMessage.senderName}: ${item.lastMessage.content}`
                : 'No messages yet'}
            </Text>
          </View>
          
          <Text style={styles.roleText}>Team Group Chat</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isLoading = activeTab === 'personal' 
    ? (loading && conversations.length === 0)
    : (groupChatsLoading && groupChats.length === 0);

  const currentData = activeTab === 'personal' ? conversations : groupChats;
  const renderItem = activeTab === 'personal' ? renderConversation : renderGroupChat;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Ionicons 
            name="person" 
            size={18} 
            color={activeTab === 'personal' ? '#6366f1' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
          {personalUnreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {personalUnreadCount > 99 ? '99+' : personalUnreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'group' && styles.activeTab]}
          onPress={() => setActiveTab('group')}
        >
          <Ionicons 
            name="people" 
            size={18} 
            color={activeTab === 'group' ? '#6366f1' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>
            Group Chats
          </Text>
          {groupChats.length > 0 && (
            <View style={[styles.tabBadge, styles.groupBadge]}>
              <Text style={styles.tabBadgeText}>{groupChats.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : currentData.length === 0 ? (
        <View style={styles.center}>
          <Ionicons 
            name={activeTab === 'personal' ? 'chatbubbles-outline' : 'people-outline'} 
            size={64} 
            color="#ccc" 
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'personal' ? 'No Conversations Yet' : 'No Group Chats Yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'personal' 
              ? 'Start messaging team members from the Teams tab or by viewing their profiles.'
              : 'Join a team to access group chats with your teammates.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderItem}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#eef2ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#6366f1',
  },
  tabBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  groupBadge: {
    backgroundColor: '#22c55e',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
  groupAvatar: {
    backgroundColor: '#6366f1',
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
