import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ title: 'Property Detail' }} />
      <Stack.Screen name="compare" options={{ title: 'Compare Properties' }} />
    </Stack>
  );
}