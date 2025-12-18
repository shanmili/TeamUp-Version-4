import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../store/useAuthStore';
import useTeamStore from '../store/useTeamStore';

export default function CreateTeam() {
  const router = useRouter();
  const createTeam = useTeamStore((s) => s.createTeam);
  const loadTeams = useTeamStore((s) => s.loadTeams);
  const loadMyTeams = useTeamStore((s) => s.loadMyTeams);
  const user = useAuthStore((s) => s.user);
  
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [durationNumber, setDurationNumber] = useState('');
  const [durationUnit, setDurationUnit] = useState('months');
  const [creating, setCreating] = useState(false);

  const durationUnits = ['days', 'weeks', 'months', 'years'];

  const handleCreateTeam = async () => {
    // Validation
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create a team');
      return;
    }

    try {
      setCreating(true);
      
      // Create team using zustand store
      const result = await createTeam({
        teamName: teamName.trim(),
        description: description.trim(),
        projectType: projectType.trim(),
        requiredSkills: requiredSkills.trim(),
        teamSize: teamSize.trim(),
        duration: durationNumber.trim() ? `${durationNumber.trim()} ${durationUnit}` : '',
      }, user.id);

      if (result.success) {
        // Reload teams to ensure UI is updated
        await loadTeams();
        await loadMyTeams(user.id);
        
        Alert.alert(
          'Success',
          'Team created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Create team error:', error);
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Team Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter team name"
            value={teamName}
            onChangeText={setTeamName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your team and project goals"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Project Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Project Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Web Development, Mobile App, Research"
            value={projectType}
            onChangeText={setProjectType}
            placeholderTextColor="#999"
          />
        </View>

        {/* Required Skills */}
        <View style={styles.section}>
          <Text style={styles.label}>Required Skills</Text>
          <TextInput
            style={styles.input}
            placeholder="Comma separated skills (e.g., React, Node.js, Design)"
            value={requiredSkills}
            onChangeText={setRequiredSkills}
            placeholderTextColor="#999"
          />
        </View>

        {/* Team Size */}
        <View style={styles.section}>
          <Text style={styles.label}>Team Size</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of members needed"
            value={teamSize}
            onChangeText={setTeamSize}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Project Duration</Text>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="Enter number"
            value={durationNumber}
            onChangeText={setDurationNumber}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <View style={styles.unitContainer}>
            {durationUnits.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitChip,
                  durationUnit === unit && styles.unitChipSelected,
                ]}
                onPress={() => setDurationUnit(unit)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    durationUnit === unit && styles.unitChipTextSelected,
                  ]}
                >
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity 
          style={[styles.createButton, creating && styles.createButtonDisabled]} 
          onPress={handleCreateTeam}
          disabled={creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Team'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unitChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unitChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  unitChipTextSelected: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
