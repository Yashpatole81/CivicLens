import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComplaintRow, GroupIcon } from '@/components/complaint-bits';
import { Button, Icon, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { GROUPS } from '@/data/categories';
import { greeting, isOpen } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function Home() {
  const { user, complaints, myComplaintIds, resetDraft } = useApp();
  const mine = complaints.filter((c) => myComplaintIds.includes(c.id));
  const open = mine.filter((c) => isOpen(c.status) && c.status !== 'in_progress').length;
  const active = mine.filter((c) => c.status === 'in_progress').length;
  const resolved = mine.filter((c) => !isOpen(c.status)).length;
  const firstName = user?.fullName.split(' ')[0] ?? '';

  const startComplaint = (group: string | null = null) => {
    resetDraft(group);
    router.push('/complaint/new');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xl }}>
        <SafeAreaView edges={['top']} style={styles.head}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hi}>{greeting()}</Text>
              <Text style={styles.name}>{firstName}</Text>
              <View style={styles.cityChip}>
                <Icon name="location-outline" size={13} color="#fff" />
                <Text style={styles.cityText}>{user?.city}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/alerts')}
              style={styles.bell}>
              <Icon name="notifications-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.report}>
            <T variant="heading" style={{ fontSize: 16 }}>See a problem on your street?</T>
            <T variant="small" style={{ marginTop: 2, marginBottom: space.md }}>Snap it. We’ll find the right department.</T>
            <Button label="Report an issue" icon="camera-outline" onPress={() => startComplaint()} />
          </View>

          <View style={styles.stats}>
            <Stat value={open} label="Open" />
            <Stat value={active} label="Active" color={colors.amber} />
            <Stat value={resolved} label="Resolved" color={colors.green7} />
          </View>

          <Text style={styles.section}>Report by type</Text>
          <View style={styles.grid}>
            {GROUPS.map((g) => (
              <Pressable
                key={g.code}
                accessibilityRole="button"
                accessibilityLabel={`Report ${g.label}`}
                onPress={() => startComplaint(g.code)}
                style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.green1 }]}>
                <GroupIcon group={g.code} />
                <Text style={styles.tileText} numberOfLines={2}>{g.shortLabel}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>Recent complaints</Text>
            {mine.length ? (
              <Pressable accessibilityRole="link" onPress={() => router.push('/track')} hitSlop={8}>
                <Text style={styles.link}>See all</Text>
              </Pressable>
            ) : null}
          </View>
          {mine.length === 0 ? (
            <T variant="small">No complaints yet. Report your first issue above.</T>
          ) : (
            mine.slice(0, 3).map((c, i, arr) => (
              <ComplaintRow key={c.id} complaint={c} last={i === arr.length - 1} onPress={() => router.push(`/complaint/${c.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, color = colors.ink }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { backgroundColor: colors.green9, paddingHorizontal: space.lg + 2, paddingTop: space.lg, paddingBottom: 64 },
  hi: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.greenOnDark },
  name: { fontFamily: fonts.display, fontSize: 28, color: '#fff', marginTop: 2 },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: space.md,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cityText: { fontFamily: fonts.semibold, fontSize: 12, color: '#fff' },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: space.lg + 2 },
  report: {
    marginTop: -48,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.green9,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statValue: { fontFamily: fonts.display, fontSize: 20 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink3 },
  section: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink, marginTop: space.lg, marginBottom: space.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.green7, marginTop: space.lg, marginBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    width: '31.5%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.md,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: '#fff',
  },
  tileText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink2, textAlign: 'center' },
});
