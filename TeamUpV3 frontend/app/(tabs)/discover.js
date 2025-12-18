import React, { useEffect } from 'react';
import { ScrollView, View, Text, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StudentCard from '../components/StudentCard';
import useDataStore from '../../store/useDataStore';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const styles = {
    container: { flex: 1, paddingTop: insets.top, paddingHorizontal: 16, backgroundColor: '#fff' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  };

  const students = useDataStore((s) => s.students);
  const loadStudents = useDataStore((s) => s.loadStudents);
  const populateSampleData = useDataStore((s) => s.populateSampleData);

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <Text style={styles.sectionTitle}>Discover Members</Text>
      {students.length === 0 ? (
        <View>
          <Text style={{ color: '#6b7280', marginBottom: 12 }}>No members found. Invite classmates or refresh to discover members.</Text>
          {__DEV__ && (
            <Button title="Populate sample members (dev)" onPress={populateSampleData} />
          )}
        </View>
      ) : (
        students.map((s, i) => (
          <StudentCard key={i} {...s} styles={styles} />
        ))
      )}
    </ScrollView>
  );
}
