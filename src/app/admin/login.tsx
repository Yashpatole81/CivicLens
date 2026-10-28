import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Button, Field, Notice, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { DEMO_STAFF } from '@/data/mock';
import { useApp } from '@/store/app-store';

const MAX_ATTEMPTS = 5;

/** Staff sign-in. Demo only: role comes from the seeded account, never from user input. */
export default function StaffLogin() {
  const { staffSignIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= MAX_ATTEMPTS;

  const onSubmit = () => {
    if (locked) return;
    if (!email.trim() || !password) return setError('Enter your work email and password.');
    const res = staffSignIn(email);
    if (!res.ok) {
      setAttempts((a) => a + 1);
      // Same message for unknown and non-staff accounts (no account enumeration).
      return setError('Email or password is incorrect, or this account has no staff access.');
    }
    router.replace('/admin');
  };

  const demo = DEMO_STAFF.filter((s) => s.role !== 'citizen');

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <View style={styles.mark}><Logo size={22} /></View>
          <Text style={styles.brandText}>CivicLens</Text>
        </View>
        <T variant="display" style={{ marginTop: space.lg }}>Staff sign in</T>
        <T variant="small" style={{ marginTop: 4 }}>For municipal officers and administrators.</T>

        <Field label="Work email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" onSubmitEditing={onSubmit} />

        {error ? <View style={{ marginTop: space.md }}><Notice tone="danger" icon="alert-circle-outline">{error}</Notice></View> : null}
        {locked ? (
          <View style={{ marginTop: space.md }}>
            <Notice tone="warn" icon="lock-closed-outline">Too many attempts. Reload the page to try again.</Notice>
          </View>
        ) : null}

        <Button label="Sign in" onPress={onSubmit} disabled={locked} style={{ marginTop: space.lg }} />

        <View style={styles.demo}>
          <T variant="caption">Demo accounts · any password</T>
          {demo.map((s) => (
            <Pressable key={s.id} accessibilityRole="button" onPress={() => { setEmail(s.email); setPassword('demo'); setError(null); }} style={styles.demoRow}>
              <Text style={styles.demoEmail}>{s.email}</Text>
              <Text style={styles.demoRole}>{s.role === 'admin' ? 'Admin' : s.department}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.green9, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: radius.lg, padding: space.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.green5, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.ink },
  demo: { marginTop: space.xl, borderTopWidth: 1, borderTopColor: colors.line2, paddingTop: space.md, gap: 4 },
  demoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, paddingVertical: 6 },
  demoEmail: { fontFamily: fonts.mono, fontSize: 12, color: colors.green7 },
  demoRole: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3, flexShrink: 1, textAlign: 'right' },
});
