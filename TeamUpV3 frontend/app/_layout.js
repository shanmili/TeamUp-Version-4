import { Stack } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';

export default function Layout() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const unsubscribe = useNotificationStore(state => state.unsubscribe);

  useEffect(() => {
    // Initialize auth state on app load
    initializeAuth();

    // Cleanup notification subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return <Stack initialRouteName="onboarding" screenOptions={{ headerShown: false }} />;
}

