import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    'Web Applications', 'Mobile Apps', 'AI/ML',
    'Data Science', 'IoT', 'Blockchain',
    'Gaming', 'Healthcare Tech', 'FinTech',
    'Education Tech', 'E-commerce', 'Social Media',
    'Security', 'Sustainability', 'AR/VR', 'Automation'
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 2 of 3</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '66%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.subtitle}>
            Choose the project areas that excite you most
          </Text>

          <View style={styles.chipsContainer}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  selectedInterests.includes(interest) && styles.chipSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.chipText,
                  selectedInterests.includes(interest) && styles.chipTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: insets.bottom || 0 }]}> 
        <TouchableOpacity 
          style={[styles.primaryButton, selectedInterests.length === 0 && styles.buttonDisabled]}
          onPress={() => {
            useAuthStore.getState().setProfileInterests(selectedInterests);
            router.push('/setup/role');
          }}
          disabled={selectedInterests.length === 0}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  stepText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginRight: 32,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 28,
    lineHeight: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
    marginBottom: 12,
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  chipTextSelected: {
    color: '#fff',
  },
  rolesContainer: {
    marginBottom: 16,
  },
  roleCard: {},
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});