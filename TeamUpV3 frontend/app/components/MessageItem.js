import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MessageItem({ avatar, avatarColor, name, role, message, time, unread, members, active, inactive, styles }) {
  return (
    <TouchableOpacity style={styles.messageItem}>
      <View style={[styles.messageAvatar, avatarColor && { backgroundColor: avatarColor }]}>
        <Text style={styles.messageAvatarText}>{avatar}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>{name}</Text>
          <Text style={styles.messageTime}>{time}</Text>
        </View>
        {role && <Text style={styles.messageRole}>{role}</Text>}
        <Text style={styles.messageText} numberOfLines={1}>{message}</Text>
        {members && (
          <View style={styles.messageMeta}>
            <Text style={styles.messageMetaText}>{members} members</Text>
            <View style={[styles.statusDot, active && styles.statusDotActive, inactive && styles.statusDotInactive]} />
            <Text style={styles.messageMetaText}>{active ? 'Active' : 'Inactive'}</Text>
          </View>
        )}
      </View>
      {unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unread}</Text>
        </View>
      )}
      <Feather name="chevron-right" color="#9ca3af" size={20} />
    </TouchableOpacity>
  );
}
