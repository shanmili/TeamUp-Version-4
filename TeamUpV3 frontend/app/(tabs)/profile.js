import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';

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

  useEffect(() => {
    loadProfileStats();
  }, []);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = useAuthStore((s) => s.user);

  // local editable copy
  const [editable, setEditable] = useState(() => ({
    name: profile?.name || user?.name || '',
    description: profile?.description || '',
    email: profile?.contact?.email || user?.email || '',
    phone: profile?.contact?.phone || profile?.phone || '',
    skills: (profile?.skills || []).join(', '),
    interests: (profile?.interests || []).join(', '),
    role: profile?.role || '',
    available: profile?.available ?? true,
    profileImage: profile?.profileImage || null,
  }));

  useEffect(() => {
    setEditable({
      name: profile?.name || user?.name || '',
      description: profile?.description || '',
      email: profile?.contact?.email || user?.email || '',
      phone: profile?.contact?.phone || profile?.phone || '',
      skills: (profile?.skills || []).join(', '),
      interests: (profile?.interests || []).join(', '),
      role: profile?.role || '',
      available: profile?.available ?? true,
      profileImage: profile?.profileImage || null,
    });
  }, [profile, user]);

  async function handleSave() {
    try {
      setSaving(true);
      
      const updates = {
        name: editable.name,
        description: editable.description,
        email: editable.email,
        phone: editable.phone,
        skills: editable.skills ? editable.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: editable.interests ? editable.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
        role: editable.role,
        available: !!editable.available,
        profile_image: editable.profileImage,
      };
      
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
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditable(e => ({ ...e, profileImage: result.assets[0].uri }));
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
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
        <TouchableOpacity onPress={editing ? handleImagePick : undefined} activeOpacity={editing ? 0.7 : 1}>
          <View style={styles.avatar}>
            {editable.profileImage ? (
              <Image source={{ uri: editable.profileImage }} style={{ width: 72, height: 72, borderRadius: 36 }} />
            ) : (
              <Text style={styles.avatarText}>{(editable.name || 'You').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</Text>
            )}
            {editing && (
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#808080', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>+</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
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
          <TextInput style={styles.editInput} value={editable.skills} onChangeText={(t)=>setEditable(e=>({...e, skills: t}))} placeholder="Comma separated skills" />
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
          <TextInput style={styles.editInput} value={editable.interests} onChangeText={(t)=>setEditable(e=>({...e, interests: t}))} placeholder="Comma separated interests" />
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
          <TextInput style={styles.editInput} value={editable.role} onChangeText={(t)=>setEditable(e=>({...e, role: t}))} placeholder="Preferred role" />
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
            skills: (profile?.skills || []).join(', '),
            interests: (profile?.interests || []).join(', '),
            role: profile?.role || '',
            available: profile?.available ?? true,
          }); }} />
          <Button title="Save" onPress={handleSave} />
        </View>
      )}
    </ScrollView>
  );
}