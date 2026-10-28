/** Shared building blocks for the municipal dashboard (web). */
import { router, usePathname, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Chip, Icon, T, type IconName } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { ADMIN_ONLY_PATHS, canView, isAdmin } from '@/lib/access';
import { useApp } from '@/store/app-store';

type NavItem = { href: Href; path: string; label: string; icon: IconName };

const NAV: NavItem[] = [
  { href: '/admin', path: '/admin', label: 'Dashboard', icon: 'grid-outline' },
  { href: '/admin/complaints', path: '/admin/complaints', label: 'Complaints', icon: 'document-text-outline' },
  { href: '/admin/departments', path: '/admin/departments', label: 'Departments', icon: 'business-outline' },
  { href: '/admin/analytics', path: '/admin/analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  { href: '/admin/categories', path: '/admin/categories', label: 'Categories', icon: 'pricetags-outline' },
  { href: '/admin/users', path: '/admin/users', label: 'Users & roles', icon: 'people-outline' },
  { href: '/admin/sla', path: '/admin/sla', label: 'SLA policies', icon: 'time-outline' },
];

/** Complaints the signed-in staff member may see (UI scoping; RLS enforces later). */
export function useScopedComplaints() {
  const { complaints, staff } = useApp();
  return complaints.filter((c) => canView(staff, c));
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { staff, staffSignOut } = useApp();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const items = NAV.filter((n) => isAdmin(staff) || !ADMIN_ONLY_PATHS.includes(n.path));
  const active = (n: NavItem) => (n.path === '/admin' ? pathname === '/admin' : pathname.startsWith(n.path));

  const signOut = () => {
    staffSignOut();
    router.replace('/admin/login');
  };

  const userBox = (
    <View style={styles.who}>
      <View style={styles.av}>
        <Text style={styles.avText}>{staff?.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.whoName} numberOfLines={1}>{staff?.name}</Text>
        <Text style={styles.whoRole} numberOfLines={1}>
          {isAdmin(staff) ? 'Admin · all departments' : `Officer · ${staff?.department}`}
        </Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={signOut} hitSlop={8}>
        <Icon name="log-out-outline" size={18} color="#CFE3D7" />
      </Pressable>
    </View>
  );

  if (!wide) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F3' }}>
        <View style={styles.topNav}>
          <View style={styles.brandRow}>
            <View style={styles.mark}><Logo size={18} /></View>
            <Text style={styles.brandText}>CivicLens</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingVertical: 8 }}>
            {items.map((n) => (
              <NavLink key={n.path} item={n} on={active(n)} compact />
            ))}
          </ScrollView>
          {userBox}
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#FAF8F3' }}>
      <View style={styles.side}>
        <View style={[styles.brandRow, { marginBottom: space.xl }]}>
          <View style={styles.mark}><Logo size={20} /></View>
          <Text style={styles.brandText}>CivicLens</Text>
        </View>
        {items.map((n) => (
          <NavLink key={n.path} item={n} on={active(n)} />
        ))}
        <View style={{ flex: 1 }} />
        <Pressable accessibilityRole="link" onPress={() => router.push('/')} style={styles.nav}>
          <Icon name="phone-portrait-outline" size={17} color="#CFE3D7" />
          <Text style={styles.navText}>Citizen app</Text>
        </Pressable>
        {userBox}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function NavLink({ item, on, compact }: { item: NavItem; on: boolean; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: on }}
      onPress={() => router.push(item.href)}
      style={[styles.nav, on && styles.navOn, compact && { paddingHorizontal: 12 }]}>
      <Icon name={item.icon} size={17} color={on ? '#fff' : '#CFE3D7'} />
      <Text style={[styles.navText, on && { color: '#fff', fontFamily: fonts.semibold }]}>{item.label}</Text>
    </Pressable>
  );
}

/** Page scaffold: scrollable, max width, title row. */
export function AdminPage({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.page}>
      <View style={styles.pageTop}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Text style={styles.h1}>{title}</Text>
          {subtitle ? <T variant="small">{subtitle}</T> : null}
        </View>
        <Chip label="DEMO DATA" fg={colors.paper} bg={colors.ink} />
        {right}
      </View>
      {children}
      <T variant="mono" style={{ fontSize: 10.5, marginTop: space.lg }}>
        FRONTEND DEMO · ACCESS RULES RUN IN THE BROWSER ONLY · REAL ENFORCEMENT COMES FROM SUPABASE RLS
      </T>
    </ScrollView>
  );
}

export function Panel({ title, right, children, style }: { title?: string; right?: string; children: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      {title ? (
        <View style={styles.panelTitle}>
          <Text style={styles.panelTitleText}>{title}</Text>
          {right ? <T variant="mono" style={{ fontSize: 10.5 }}>{right}</T> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Kpi({ label, value, sub, bar = colors.line, danger }: { label: string; value: string | number; sub?: string; bar?: string; danger?: boolean }) {
  return (
    <View style={[styles.kpi, danger && { backgroundColor: colors.redBg, borderColor: '#F1C2BC' }]}>
      <View style={[styles.kpiBar, { backgroundColor: danger ? colors.red : bar }]} />
      <Text style={[styles.kpiLabel, danger && { color: colors.red }]}>{label}</Text>
      <Text style={[styles.kpiValue, danger && { color: colors.red }]}>{value}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

export function BarRow({ label, value, max, right, color = colors.green7 }: { label: string; value: number; max: number; right?: ReactNode; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <View style={styles.bar}>
      <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={{ width: 70, alignItems: 'flex-end' }}>
        {right ?? <Text style={styles.barNum}>{value}</Text>}
      </View>
    </View>
  );
}

export function NoAccess() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
      <Icon name="lock-closed-outline" size={36} color={colors.ink3} />
      <T variant="heading" style={{ marginTop: space.sm }}>Admins only</T>
      <T variant="small" style={{ textAlign: 'center', marginTop: 4 }}>Your officer account can’t open this page.</T>
    </View>
  );
}

export const adminStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap', alignItems: 'flex-start' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: space.sm, borderBottomWidth: 1, borderBottomColor: colors.line2 },
  th: { borderBottomWidth: 1.5, borderBottomColor: colors.line, paddingVertical: 8 },
  thText: { fontFamily: fonts.monoBold, fontSize: 10.5, color: colors.ink3, letterSpacing: 0.8 },
  mono: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink2 },
  cellTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  pill: { height: 32, paddingHorizontal: 11, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, justifyContent: 'center', backgroundColor: '#fff' },
  pillOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  pillText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink2 },
});

const styles = StyleSheet.create({
  side: { width: 230, backgroundColor: colors.green9, paddingVertical: space.lg, paddingHorizontal: space.md, gap: 2 },
  topNav: { backgroundColor: colors.green9, paddingHorizontal: space.md, paddingTop: space.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 6 },
  mark: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.green5, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: fonts.displayBold, fontSize: 20, color: '#fff' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 40, paddingHorizontal: 10, borderRadius: 9 },
  navOn: { backgroundColor: 'rgba(255,255,255,0.12)' },
  navText: { fontFamily: fonts.medium, fontSize: 13.5, color: '#CFE3D7' },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: space.sm },
  av: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7FD1A8', alignItems: 'center', justifyContent: 'center' },
  avText: { fontFamily: fonts.bold, fontSize: 12, color: colors.green9 },
  whoName: { fontFamily: fonts.semibold, fontSize: 12.5, color: '#fff' },
  whoRole: { fontFamily: fonts.regular, fontSize: 11, color: '#B7D7C5' },

  page: { padding: space.xl, gap: space.md, maxWidth: 1400, width: '100%' },
  pageTop: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap', marginBottom: space.sm },
  h1: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },

  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: space.lg },
  panelTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  panelTitleText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },

  kpi: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingLeft: space.lg,
    paddingRight: space.md,
    overflow: 'hidden',
  },
  kpiBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  kpiLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink3 },
  kpiValue: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginTop: 4 },
  kpiSub: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink3 },

  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 5 },
  barLabel: { width: 200, fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.line2, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barNum: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink2 },
});
