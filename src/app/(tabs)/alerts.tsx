import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, StatusChip, T } from '@/components/ui';
import { colors, space } from '@/constants/theme';
import { STATUS_LABEL, timeAgo } from '@/lib/format';
import { useApp } from '@/store/app-store';
import type { Status } from '@/types';

type Alert = { key: string; complaintId: string; reference: string; title: string; status: Status; at: string; update?: string };

/** In-app notifications, derived from status history of the citizen's complaints. */
export default function Alerts() {
  const { complaints, myComplaintIds } = useApp();
  const alerts: Alert[] = complaints
    .filter((c) => myComplaintIds.includes(c.id))
    .flatMap((c) =>
      c.history
        .filter((h) => h.status !== 'submitted')
        .map((h, i) => ({ key: `${c.id}-${i}`, complaintId: c.id, reference: c.reference, title: c.title, status: h.status, at: h.at, update: h.update })),
    )
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.key}
        contentContainerStyle={{ paddingHorizontal: space.lg + 2, paddingBottom: space.xl, flexGrow: 1 }}
        ListHeaderComponent={<T variant="display" style={{ paddingTop: space.md, marginBottom: space.sm }}>Alerts</T>}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/complaint/${item.complaintId}`)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <View style={styles.icon}>
              <Icon name="notifications-outline" size={18} color={colors.green7} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <T variant="heading" style={{ fontSize: 13.5 }}>
                {item.reference} is now {STATUS_LABEL[item.status].toLowerCase()}
              </T>
              <T variant="small" numberOfLines={2}>{item.update ?? item.title}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 }}>
                <StatusChip status={item.status} />
                <T variant="mono" style={{ fontSize: 11 }}>{timeAgo(item.at)}</T>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="notifications-off-outline" size={36} color={colors.ink3} />
            <T variant="small" style={{ marginTop: space.sm }}>No updates yet.</T>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.line2 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green1, alignItems: 'center', justifyContent: 'center' },
});
