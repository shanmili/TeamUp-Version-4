import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack initialRouteName="onboarding" screenOptions={{ headerShown: false }} />;
}
