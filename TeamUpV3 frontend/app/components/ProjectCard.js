import React from 'react';
import { View, Text } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function ProjectCard({ title, members, dueDate, tags, match, styles }) {
  return (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{title}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{match}% match</Text>
        </View>
      </View>
      <View style={styles.projectMeta}>
        <View style={styles.metaItem}>
          <Feather name="users" color="#666" size={14} />
          <Text style={styles.metaText}>{members} members</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="calendar-today" color="#666" size={14} />
          <Text style={styles.metaText}>Due {dueDate}</Text>
        </View>
      </View>
      <View style={styles.techTags}>
        {tags.map((tag, index) => (
          <Text key={index} style={styles.techTag}>{tag}</Text>
        ))}
      </View>
    </View>
  );
}
