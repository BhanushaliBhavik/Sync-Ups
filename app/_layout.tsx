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
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTintColor: '#000000',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen 
          name="property-preferences" 
          options={{ 
            title: 'Property Preferences',
            headerShown: true,
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="property/[id]" 
          options={{ 
            title: 'Property Details',
            headerShown: true,
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="compare" 
          options={{ 
            title: 'Compare Properties',
            headerShown: true,
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
    </QueryClientProvider>
  );
}