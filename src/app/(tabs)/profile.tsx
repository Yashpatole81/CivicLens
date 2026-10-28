import { router } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Icon, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { COUNTRIES, STATES } from '@/data/locations';
import { useApp } from '@/store/app-store';

export default function Profile() {
  const { user, signOut } = useApp();
  if (!user) return null;
  const initials = user.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const state = STATES.find((s) => s.id === user.state)?.name;
  const country = COUNTRIES.find((c) => c.code === user.country)?.name;

  return (
    <Screen edges={['top']}>
      <T variant="display" style={{ marginTop: space.sm }}>Profile</T>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="heading">{user.fullName}</T>
          <T variant="small">{user.email}</T>
        </View>
      </Card>

      <Card style={{ marginTop: space.md, gap: space.md }}>
        <Row icon="location-outline" label="Home city" value={`${user.city}, ${state ?? ''}`} />
        <Row icon="flag-outline" label="Country" value={country ?? user.country} />
        <Row icon="shield-checkmark-outline" label="Account" value="Citizen · email verified" />
      </Card>

      {Platform.OS === 'web' ? (
        <Button kind="outline" label="Open municipal dashboard" icon="grid-outline" style={{ marginTop: space.lg }} onPress={() => router.push('/admin')} />
      ) : null}

      <Button
        kind="outline"
        label="Log out"
        icon="log-out-outline"
        style={{ marginTop: space.lg }}
        onPress={() => {
          signOut();
          router.replace('/welcome');
        }}
      />
      <T variant="mono" style={{ textAlign: 'center', marginTop: space.xl, fontSize: 10 }}>
        CIVICLENS DEMO · NOT AFFILIATED WITH ANY MUNICIPAL CORPORATION
      </T>
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Icon name={icon} size={18} color={colors.green7} />
      <View style={{ flex: 1 }}>
        <T variant="caption">{label}</T>
        <T variant="body">{value}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.green7, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.bold, fontSize: 18, color: '#fff' },
});
