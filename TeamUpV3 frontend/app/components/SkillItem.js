import React from 'react';
import { View, Text } from 'react-native';

export default function SkillItem({ skill, level, category, styles }) {
  const levelColors = {
    'Advanced': '#10b981',
    'Intermediate': '#f59e0b',
    'Beginner': '#9ca3af'
  };
  
  return (
    <View style={styles.skillItem}>
      <View style={styles.skillInfo}>
        <Text style={styles.skillName}>{skill}</Text>
        <Text style={styles.skillCategory}>{category}</Text>
      </View>
      <View style={[styles.skillLevel, { backgroundColor: levelColors[level] }]}>
        <Text style={styles.skillLevelText}>{level}</Text>
      </View>
    </View>
  );
}
