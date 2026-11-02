import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Button, Field, Notice, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { DEMO_STAFF } from '@/data/mock';
import { useApp } from '@/store/app-store';

const MAX_ATTEMPTS = 5;

/** Staff sign-in. */
export default function StaffLogin() {
  const { staffSignIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= MAX_ATTEMPTS;

  const onSubmit = async () => {
    if (locked || loading) return;
    if (!email.trim() || !password) return setError('Enter your work email and password.');
    setLoading(true);
    setError(null);
    const res = await staffSignIn(email, password);
    setLoading(false);
    if (!res.ok) {
      setAttempts((a) => a + 1);
      return setError(res.error || 'Email or password is incorrect, or this account has no staff access.');
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

        <Field
          label="Work email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="name@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          onSubmitEditing={onSubmit}
        />

        {error ? <View style={{ marginTop: space.md }}><Notice tone="danger" icon="alert-circle-outline">{error}</Notice></View> : null}
        {locked ? (
          <View style={{ marginTop: space.md }}>
            <Notice tone="warn" icon="lock-closed-outline">Too many attempts. Reload the page to try again.</Notice>
          </View>
        ) : null}

        <Button
          label={loading ? "Signing in..." : "Sign in"}
          onPress={onSubmit}
          disabled={locked || loading}
          style={{ marginTop: space.lg }}
        />

        <View style={styles.demo}>
          <T variant="caption">Municipal staff accounts</T>
          {demo.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => {
                setEmail(s.email);
                setPassword('staff');
                setError(null);
              }}
              style={styles.demoRow}
            >
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
  wrap: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', padding: space.md },
  card: { width: '100%', maxWidth: 440, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: space.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.green7, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.ink },
  demo: { marginTop: space.xl, borderTopWidth: 1, borderTopColor: colors.line2, paddingTop: space.md, gap: 4 },
  demoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, paddingVertical: 6 },
  demoEmail: { fontFamily: fonts.mono, fontSize: 12, color: colors.green7 },
  demoRole: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3, flexShrink: 1, textAlign: 'right' },
});
