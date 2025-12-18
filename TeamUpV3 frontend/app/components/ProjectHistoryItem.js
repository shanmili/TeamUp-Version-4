import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProjectHistoryItem({ title, role, rating, status, statusColor, styles }) {
  return (
    <View style={styles.projectHistoryItem}>
      <View style={styles.projectHistoryInfo}>
        <Text style={styles.projectHistoryTitle}>{title}</Text>
        <Text style={styles.projectHistoryRole}>{role}</Text>
        <View style={styles.projectHistoryRating}>
          <MaterialIcons name="star" color="#f59e0b" size={14} />
          <Text style={styles.projectHistoryRatingText}>{rating} rating</Text>
        </View>
      </View>
      <View style={[styles.projectStatus, { backgroundColor: statusColor }]}>
        <Text style={styles.projectStatusText}>{status}</Text>
      </View>
    </View>
  );
}
