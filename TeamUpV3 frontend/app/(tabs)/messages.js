import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function Messages() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>No messages yet — conversations will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666', textAlign: 'center' },
});
