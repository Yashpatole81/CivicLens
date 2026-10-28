import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Icon, T, TopBar } from '@/components/ui';
import { colors, space } from '@/constants/theme';
import { useApp } from '@/store/app-store';

const RESEND_SECONDS = 60;

export default function Verify() {
  const { pendingEmail } = useApp();
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <Screen
      footer={
        <>
          <Button label="I've verified, log in" onPress={() => router.replace('/welcome')} />
          <Button
            kind="ghost"
            label={wait > 0 ? `Resend link in 0:${String(wait).padStart(2, '0')}` : 'Resend link'}
            disabled={wait > 0}
            onPress={() => setWait(RESEND_SECONDS)}
          />
        </>
      }>
      <TopBar onBack={() => router.replace('/register')} />
      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name="mail-outline" size={38} color={colors.green7} />
        </View>
        <T variant="display" style={{ textAlign: 'center' }}>Check your inbox</T>
        <T variant="small" style={{ textAlign: 'center', marginTop: space.sm, lineHeight: 20 }}>
          We sent a verification link to{'\n'}
          <T variant="heading" style={{ fontSize: 13 }}>{pendingEmail ?? 'your email'}</T>
          {'\n'}Verify once, then log in.
        </T>
        <Card style={styles.note}>
          <Icon name="shield-checkmark-outline" size={20} color={colors.green7} />
          <T variant="small" style={{ flex: 1, color: colors.ink2 }}>
            You can’t log in until your email is verified. This only happens once.
          </T>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.green1,
    borderWidth: 1.5,
    borderColor: colors.green2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
    transform: [{ rotate: '-4deg' }],
  },
  note: { flexDirection: 'row', gap: space.sm, alignItems: 'center', marginTop: space.xl, alignSelf: 'stretch' },
});
