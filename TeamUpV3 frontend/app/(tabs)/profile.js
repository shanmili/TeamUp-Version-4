import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageHelpers } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import useTeamStore from '../../store/useTeamStore';

// Predefined options
const SKILLS_OPTIONS = [
  'JavaScript', 'React', 'Node.js', 'Python',
  'Java', 'C++', 'Database Design', 'UI/UX Design',
  'Machine Learning', 'Data Analysis', 'Project Management',
  'Research', 'Technical Writing', 'Testing',
  'Mobile Development', 'Web Development', 'API Development', 'DevOps'
];

const INTERESTS_OPTIONS = [
  'Web Applications', 'Mobile Apps', 'AI/ML',
  'Data Science', 'IoT', 'Blockchain',
  'Gaming', 'Healthcare Tech', 'FinTech',
  'Education Tech', 'E-commerce', 'Social Media',
  'Security', 'Sustainability', 'AR/VR', 'Automation'
];

const ROLE_OPTIONS = [
  { title: 'Front-End Developer', description: 'Focus on user interface and user experience' },
  { title: 'Back-End Developer', description: 'Focus on server-side logic and database management' },
  { title: 'Team Lead', description: 'Coordinate team activities and project management' },
  { title: 'Researcher', description: 'Focus on research, analysis, and documentation' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: insets.top, paddingHorizontal: 16, backgroundColor: '#fff' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    settingsBox: { position: 'absolute', top: 44, right: 16, backgroundColor: '#fff', borderRadius: 8, padding: 8, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, zIndex: 1000 },
    section: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: '#f9fafb' },
    sectionTitle: { fontWeight: '700', marginBottom: 12, fontSize: 16 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#808080', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
    row: { flexDirection: 'row', alignItems: 'center' },
    chip: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
    editInput: { backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  });

  const profileStats = useDataStore((s) => s.profileStats);
  const loadProfileStats = useDataStore((s) => s.loadProfileStats);
  const populateSampleData = useDataStore((s) => s.populateSampleData);

  // Read profile setup from auth store
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // Team store for checking active teams
  const myTeams = useTeamStore((s) => s.myTeams);
  const joinedTeams = useTeamStore((s) => s.joinedTeams);
  const loadMyTeams = useTeamStore((s) => s.loadMyTeams);
  const loadJoinedTeams = useTeamStore((s) => s.loadJoinedTeams);
  const leaveTeam = useTeamStore((s) => s.leaveTeam);

  // Check if user is in any active team
  const isTeamLead = typeof profile?.role === 'string' && profile.role.toLowerCase().includes('lead');
  const hasActiveCreatedTeams = myTeams.filter(t => t.status === 'active').length > 0;
  const hasActiveJoinedTeams = joinedTeams.filter(t => t.status === 'active').length > 0;
  const hasActiveTeams = hasActiveCreatedTeams || hasActiveJoinedTeams;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    loadProfileStats();
    if (user?.id) {
      loadMyTeams(user.id);
      loadJoinedTeams(user.id);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await initializeAuth();
      await loadProfileStats();
      if (user?.id) {
        await loadMyTeams(user.id);
        await loadJoinedTeams(user.id);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  // local editable copy
  const [editable, setEditable] = useState(() => ({
    name: profile?.name || user?.name || '',
    description: profile?.description || '',
    email: profile?.contact?.email || user?.email || '',
    phone: profile?.contact?.phone || profile?.phone || '',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    role: profile?.role || '',
    available: profile?.available ?? true,
    profileImage: profile?.avatar_url || null,
  }));

  // Track if user explicitly changed the profile image
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    setEditable({
      name: profile?.name || user?.name || '',
      description: profile?.description || '',
      email: profile?.contact?.email || user?.email || '',
      phone: profile?.contact?.phone || profile?.phone || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      role: profile?.role || '',
      available: profile?.available ?? true,
      profileImage: profile?.avatar_url || null,
    });
    // Reset image changed flag when profile reloads
    setImageChanged(false);
  }, [profile, user]);

  const toggleSkill = (skill) => {
    setEditable(e => ({
      ...e,
      skills: e.skills.includes(skill) 
        ? e.skills.filter(s => s !== skill)
        : [...e.skills, skill]
    }));
  };

  const toggleInterest = (interest) => {
    setEditable(e => ({
      ...e,
      interests: e.interests.includes(interest)
        ? e.interests.filter(i => i !== interest)
        : [...e.interests, interest]
    }));
  };

  async function handleSave() {
    try {
      setSaving(true);
      
      const updates = {
        name: editable.name,
        description: editable.description,
        email: editable.email,
        phone: editable.phone,
        skills: editable.skills || [],
        interests: editable.interests || [],
        role: editable.role,
        available: !!editable.available,
        profile_image: editable.profileImage,
      };
      
      // Only include profile image if it was explicitly changed by the user
      if (imageChanged) {
        updates.profile_image = editable.profileImage;
      }
      
      const result = await updateProfile(updates);
      
      if (result.success) {
        setEditing(false);
        setSettingsOpen(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImagePick() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      
      // Mark that user explicitly changed the image
      setImageChanged(true);
      
      // Show local image immediately for preview
      setEditable(e => ({ ...e, profileImage: localUri }));
      
      // Upload to Supabase Storage
      setUploadingImage(true);
      try {
        const { url, error } = await storageHelpers.uploadProfileImage(user.id, localUri);
        
        if (error) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
          setEditable(e => ({ ...e, profileImage: profile?.avatar_url || null }));
        } else if (url) {
          // Update with the public URL
          setEditable(e => ({ ...e, profileImage: url }));
        }
      } catch (error) {
        console.error('Upload exception:', error);
        Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    }
  }

  function handleSignOut() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out and return to onboarding?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => { signOut(); router.replace('/onboarding'); } },
      ],
    );
  }

  async function handleLeaveTeamRequest() {
    // Get the list of active teams the user has joined
    const activeJoinedTeams = joinedTeams.filter(t => t.status === 'active');
    
    if (activeJoinedTeams.length === 0) {
      Alert.alert('No Active Teams', 'You are not a member of any active teams.');
      return;
    }

    // Direct user to team details to submit a leave request
    if (activeJoinedTeams.length === 1) {
      const team = activeJoinedTeams[0];
      Alert.alert(
        'Request to Leave Team',
        `To leave "${team.teamName || team.name}", you need to submit a request to the team lead for approval. Would you like to go to the team details page?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Team', 
            onPress: () => {
              router.push(`/team-details?teamId=${team.id}`);
            }
          }
        ]
      );
    } else {
      // Multiple teams - direct to Teams tab
      Alert.alert(
        'Multiple Teams',
        'You are a member of multiple active teams. Please go to the Teams tab and select a team to request to leave.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with title and settings */}
      <View style={styles.headerRow}>
        <Text style={{ fontSize: 24, fontWeight: '700', flex: 1 }}>Profile</Text>
        <TouchableOpacity onPress={() => setSettingsOpen(s => !s)} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
        {settingsOpen && (
          <View style={styles.settingsBox}>
            <TouchableOpacity onPress={() => { setEditing(true); setSettingsOpen(false); }} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
              <Text>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
              <Text style={{ color: '#ff4444' }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Container 1: Profile Picture, Name, and Availability */}
      <View style={[styles.section, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={editing ? handleImagePick : undefined} activeOpacity={editing ? 0.7 : 1} disabled={uploadingImage}>
          <View style={styles.avatar}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : editable.profileImage || profile?.avatar_url ? (
              <Image source={{ uri: editable.profileImage || profile?.avatar_url }} style={{ width: 72, height: 72, borderRadius: 36 }} />
            ) : (
              <Text style={styles.avatarText}>{(editable.name || 'You').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</Text>
            )}
            {editing && !uploadingImage && (
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>📷</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {uploadingImage && <Text style={{ color: '#666', marginTop: 8, fontSize: 12 }}>Uploading image...</Text>}
        {editing ? (
          <>
            <TextInput style={[styles.editInput, { width: '80%', textAlign: 'center', marginTop: 12 }]} value={editable.name} onChangeText={(t)=>setEditable(e=>({...e, name: t}))} placeholder="Your name" />
            <TextInput style={[styles.editInput, { width: '80%', textAlign: 'center' }]} value={editable.description} onChangeText={(t)=>setEditable(e=>({...e, description: t}))} placeholder="Add a short bio" multiline />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 12 }}>{editable.name || 'Your Name'}</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 16 }}>{editable.description || 'No description yet'}</Text>
          </>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ marginRight: 8 }}>Available for new teams</Text>
          <Switch value={!!editable.available} onValueChange={(v)=>{ setEditable(e=>({...e, available: v})); setProfile({...profile, available: v}); }} />
        </View>
      </View>

      {/* Container 2: Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        {editing ? (
          <>
            <TextInput style={styles.editInput} value={editable.email} onChangeText={(t)=>setEditable(e=>({...e, email: t}))} placeholder="Email" keyboardType="email-address" />
            <TextInput style={styles.editInput} value={editable.phone} onChangeText={(t)=>setEditable(e=>({...e, phone: t}))} placeholder="Phone" keyboardType="phone-pad" />
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>📧</Text>
              <Text>{editable.email || 'No email set'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>📱</Text>
              <Text>{editable.phone || 'No phone set'}</Text>
            </View>
          </>
        )}
      </View>

      {/* Container 3: Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {editing ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {SKILLS_OPTIONS.map((skill) => {
              const isSelected = editable.skills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  onPress={() => toggleSkill(skill)}
                  style={{
                    backgroundColor: isSelected ? '#4f46e5' : '#f3f4f6',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#4f46e5' : '#e5e7eb',
                  }}
                >
                  <Text style={{ color: isSelected ? '#fff' : '#374151', fontSize: 13 }}>{skill}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {(profile.skills||[]).length > 0 ? (profile.skills.map((s,i)=>(<Text key={i} style={{ backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>{s}</Text>))) : <Text style={{ color: '#6b7280' }}>No skills added</Text>}
          </View>
        )}
      </View>

      {/* Container 4: Interests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        {editing ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {INTERESTS_OPTIONS.map((interest) => {
              const isSelected = editable.interests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={{
                    backgroundColor: isSelected ? '#10b981' : '#f3f4f6',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#10b981' : '#e5e7eb',
                  }}
                >
                  <Text style={{ color: isSelected ? '#fff' : '#374151', fontSize: 13 }}>{interest}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {(profile.interests||[]).length > 0 ? (profile.interests.map((i,idx)=>(<Text key={idx} style={{ backgroundColor: '#f0fff4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>{i}</Text>))) : <Text style={{ color: '#6b7280' }}>No interests added</Text>}
          </View>
        )}
      </View>

      {/* Container 5: Preferred Role */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Role</Text>
        {editing ? (
          <>
            {hasActiveTeams && (
              <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#f59e0b' }}>
                <Text style={{ color: '#92400e', fontWeight: '600', marginBottom: 4 }}>
                  ⚠️ Role Change Restricted
                </Text>
                <Text style={{ color: '#92400e', fontSize: 13 }}>
                  {hasActiveCreatedTeams 
                    ? 'You have active teams. Please finish or terminate your teams before changing your role.'
                    : 'You are a member of an active team. Please finish the project first, or leave the team (this will notify the team lead).'
                  }
                </Text>
                {hasActiveJoinedTeams && !hasActiveCreatedTeams && (
                  <TouchableOpacity 
                    style={{ marginTop: 8, backgroundColor: '#dc2626', padding: 10, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => handleLeaveTeamRequest()}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Request to Leave Team</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', opacity: hasActiveTeams ? 0.5 : 1 }}>
              {ROLE_OPTIONS.map((roleOption) => {
                const isSelected = editable.role === roleOption.title;
                return (
                  <TouchableOpacity
                    key={roleOption.title}
                    onPress={() => {
                      if (hasActiveTeams) {
                        Alert.alert(
                          'Cannot Change Role',
                          hasActiveCreatedTeams 
                            ? 'You must finish or terminate all your active teams before changing your preferred role.'
                            : 'You must complete your current team project or leave the team before changing your preferred role.',
                          [{ text: 'OK' }]
                        );
                        return;
                      }
                      setEditable(e => ({ ...e, role: roleOption.title }));
                    }}
                    style={{
                      backgroundColor: isSelected ? '#6366f1' : '#f3f4f6',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      marginRight: 10,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? '#6366f1' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ color: isSelected ? '#fff' : '#374151', fontWeight: isSelected ? '600' : '400' }}>{roleOption.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <Text>{profile.role || 'No preferred role set'}</Text>
        )}
      </View>

      {/* Save / Cancel buttons when editing */}
      {editing && (
        <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
          <Button title="Cancel" color="#6b7280" onPress={()=>{ setEditing(false); setEditable({
            name: profile?.name || user?.name || '',
            description: profile?.description || '',
            email: profile?.contact?.email || user?.email || '',
            phone: profile?.contact?.phone || profile?.phone || '',
            skills: profile?.skills || [],
            interests: profile?.interests || [],
            role: profile?.role || '',
            available: profile?.available ?? true,
          }); }} />
          <Button title="Save" onPress={handleSave} />
        </View>
      )}
    </ScrollView>
  );
}