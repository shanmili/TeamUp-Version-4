import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MemberRequestCard({ name, major, gpa, project, skills, message, time, match, styles }) {
  return (
    <View style={styles.memberRequestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{name}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{match}% match</Text>
        </View>
        <Text style={styles.requestTime}>{time}</Text>
      </View>
      <Text style={styles.requestMajor}>{major} • GPA: {gpa}</Text>
      <Text style={styles.requestProject}>Applying for: {project}</Text>
      
      <View style={styles.skillTags}>
        {skills.map((skill, index) => (
          <Text key={index} style={styles.skillTag}>{skill}</Text>
        ))}
      </View>
      
      <Text style={styles.requestMessage}>"{message}"</Text>
      
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.approveButton}>
          <Feather name="check" color="#fff" size={18} />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <Feather name="x" color="#fff" size={18} />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
