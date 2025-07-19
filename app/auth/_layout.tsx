import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
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
      <Stack.Screen 
        name="signin" 
        options={{ 
          title: 'Sign In',
          headerShown: true,
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: 'Sign Up',
          headerShown: true,
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
} 