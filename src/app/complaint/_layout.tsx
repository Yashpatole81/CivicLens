import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/store/app-store';

export default function ComplaintLayout() {
  const { user } = useApp();
  if (!user) return <Redirect href="/welcome" />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="category" options={{ presentation: 'modal' }} />
      <Stack.Screen name="submitted" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
