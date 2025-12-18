import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function StudentCard({ name, major, rating, projects, availability, skills, interests, match, styles }) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{name}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{match}% match</Text>
        </View>
      </View>
      <Text style={styles.studentMajor}>{major}</Text>
      <View style={styles.studentMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="star" color="#f59e0b" size={14} />
          <Text style={styles.metaText}>{rating}</Text>
        </View>
        <Text style={styles.metaText}>• {projects} projects</Text>
        <Text style={styles.metaText}>• {availability}</Text>
      </View>
      
      <Text style={styles.cardLabel}>Skills</Text>
      <View style={styles.skillTags}>
        {skills.map((skill, index) => (
          <Text key={index} style={styles.skillTagOutline}>{skill}</Text>
        ))}
      </View>
      
      <Text style={styles.cardLabel}>Interests</Text>
      <View style={styles.skillTags}>
        {interests.map((interest, index) => (
          <Text key={index} style={styles.interestTagSmall}>{interest}</Text>
        ))}
      </View>
    </View>
  );
}
