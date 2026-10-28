import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/store/app-store';

export default function AuthLayout() {
  const { user } = useApp();
  if (user) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
