import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import '../global.css';
import { useAuthInit } from '../hooks/useAuth';

const queryClient = new QueryClient();

export default function RootLayout() {
  // Initialize auth state and listen to changes
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="property-preferences" options={{ title: 'Property Preferences', headerShown: false }} />
        <Stack.Screen name="property/[id]" options={{ title: 'Property Detail' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare Properties' }} />
        <Stack.Screen name="debug-auth" options={{ title: 'Auth Debug', presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}