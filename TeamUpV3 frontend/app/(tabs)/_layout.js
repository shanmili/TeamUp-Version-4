import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { groupChatHelpers } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';
import useMessageStore from '../../store/useMessageStore';

// Badge component for showing unread count
function TabBarIconWithBadge({ icon, color, size, badgeCount }) {
  return (
    <View style={{ width: 24, height: 24 }}>
      <Feather name={icon} size={size} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const { conversations, fetchConversations, getTotalUnreadCount } = useMessageStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [groupChatCount, setGroupChatCount] = useState(0);

  // Fetch conversations and group chats, update unread count
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
      loadGroupChats();
    }
  }, [user?.id]);

  // Load group chats to get activity count
  const loadGroupChats = async () => {
    if (!user?.id) return;
    const { data } = await groupChatHelpers.getUserGroupChats(user.id);
    if (data) {
      // Count group chats with recent activity (last 24 hours)
      const recentChats = data.filter(chat => {
        if (!chat.last_message_at) return false;
        const lastMessage = new Date(chat.last_message_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastMessage > dayAgo;
      });
      setGroupChatCount(recentChats.length);
    }
  };

  // Update unread count when conversations change
  useEffect(() => {
    setUnreadCount(getTotalUnreadCount());
  }, [conversations]);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      fetchConversations(user.id);
      loadGroupChats();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge 
              icon="message-square" 
              size={size} 
              color={color} 
              badgeCount={unreadCount + groupChatCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
