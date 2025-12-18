import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeamUpOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>👥</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>TeamUp</Text>
        <Text style={styles.subtitle}>Find your perfect capstone team</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {/* Feature 1 */}
          <View style={styles.featureCard}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>👥</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Find Compatible Teammates</Text>
              <Text style={styles.featureDescription}>
                Match with students based on skills, interests, and roles
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureCard}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>👥</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Create or Join Groups</Text>
              <Text style={styles.featureDescription}>
                Start your own team or join existing groups looking for members
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureCard}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>🎓</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Auto-Matched Faculty Advisers</Text>
              <Text style={styles.featureDescription}>
                Get paired with the perfect faculty adviser for your project
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/signup')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/signin')}>
            <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 48,
  },
  featuresContainer: {
    
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingBottom: 20,
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
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  logoEmoji: {
    color: '#fff',
    fontSize: 34,
  },
  iconEmoji: {
    fontSize: 18,
    color: '#2563eb',
  },
});