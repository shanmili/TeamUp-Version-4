import React from 'react';
import { View, Text } from 'react-native';

export default function StatBox({ value, label, color, styles }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
