import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';

export default function SkillsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSkills, setSelectedSkills] = useState(['Database Design']);

  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python',
    'Java', 'C++', 'Database Design', 'UI/UX Design',
    'Machine Learning', 'Data Analysis', 'Project Management',
    'Research', 'Technical Writing', 'Testing',
    'Mobile Development', 'Web Development', 'API Development', 'DevOps'
  ];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
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
        <Text style={styles.stepText}>Step 1 of 3</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '33%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>What are your skills?</Text>
          <Text style={styles.subtitle}>
            Select the technical skills you have experience with
          </Text>

          <View style={styles.chipsContainer}>
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.chip,
                  selectedSkills.includes(skill) && styles.chipSelected
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text style={[
                  styles.chipText,
                  selectedSkills.includes(skill) && styles.chipTextSelected
                ]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: insets.bottom || 0 }]}> 
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            // persist selected skills to global auth store
            useAuthStore.getState().setProfileSkills(selectedSkills);
            router.push('/setup/interests');
          }}
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
