import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, StatusChip, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { getCategory, getGroup } from '@/data/categories';
import { formatStamp, STATUS_LABEL, timeAgo } from '@/lib/format';
import type { Complaint, HistoryEntry } from '@/types';

/** Complaint photo. Seeded demo rows have no photo, so a category placeholder is drawn. */
export function Photo({ uri, category, style }: { uri: string | null; category: string; style?: StyleProp<ViewStyle> }) {
  const group = getGroup(getCategory(category).group);
  return (
    <View style={[styles.photo, { backgroundColor: group.bg }, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Complaint photo" />
      ) : (
        <Icon name={group.icon} size={26} color={group.tint} />
      )}
    </View>
  );
}

export function GroupIcon({ group, size = 32 }: { group: Parameters<typeof getGroup>[0]; size?: number }) {
  const g = getGroup(group);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: g.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={g.icon} size={size * 0.55} color={g.tint} />
    </View>
  );
}

/** Row used in "My complaints" and on Home. */
export function ComplaintRow({ complaint, onPress, last }: { complaint: Complaint; onPress: () => void; last?: boolean }) {
  const lastActivity = complaint.history[complaint.history.length - 1]?.at ?? complaint.createdAt;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${complaint.title}, ${STATUS_LABEL[complaint.status]}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && { borderBottomWidth: 0 }, pressed && { opacity: 0.7 }]}>
      <Photo uri={complaint.photoUri} category={complaint.category} style={styles.thumb} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="mono" style={{ fontSize: 11 }}>{complaint.reference}</T>
        <T variant="heading" style={{ fontSize: 14 }} numberOfLines={2}>{complaint.title}</T>
        <View style={styles.rowFoot}>
          <T variant="small" style={{ flex: 1, fontSize: 11.5 }} numberOfLines={1}>
            {complaint.department} · {timeAgo(lastActivity)}
          </T>
          <StatusChip status={complaint.status} />
        </View>
      </View>
    </Pressable>
  );
}

/** Vertical status timeline. Only citizen-visible updates are shown. */
export function Timeline({ history, pendingResolved }: { history: HistoryEntry[]; pendingResolved: boolean }) {
  const items = [...history];
  return (
    <View accessibilityLabel="Status history">
      {items.map((h, i) => {
        const latest = i === items.length - 1 && pendingResolved;
        const isLast = i === items.length - 1 && !pendingResolved;
        return (
          <View key={`${h.status}-${h.at}-${i}`} style={styles.tlItem}>
            <View style={styles.tlRail}>
              <View style={[styles.tlNode, latest && styles.tlNow]}>
                <Icon name={latest ? 'time-outline' : 'checkmark'} size={13} color="#fff" />
              </View>
              {!isLast ? <View style={styles.tlLine} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.tlTitle}>{STATUS_LABEL[h.status]}</Text>
                {latest ? <Text style={styles.tlLatest}>Latest</Text> : null}
              </View>
              <Text style={styles.tlTime}>{formatStamp(h.at)}</Text>
              {h.update ? <Text style={styles.tlUpdate}>“{h.update}”</Text> : null}
            </View>
          </View>
        );
      })}
      {pendingResolved ? (
        <View style={styles.tlItem}>
          <View style={styles.tlRail}>
            <View style={[styles.tlNode, styles.tlWait]}>
              <Icon name="flag-outline" size={12} color={colors.ink3} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tlTitle, { color: colors.ink3 }]}>Resolved</Text>
            <Text style={styles.tlTime}>PENDING</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { borderRadius: radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  rowFoot: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 },

  tlItem: { flexDirection: 'row', gap: space.md },
  tlRail: { width: 26, alignItems: 'center' },
  tlNode: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.green7, alignItems: 'center', justifyContent: 'center' },
  tlNow: { backgroundColor: colors.amber, borderWidth: 4, borderColor: colors.amberBg, width: 30, height: 30, borderRadius: 15 },
  tlWait: { backgroundColor: '#fff', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line },
  tlLine: { flex: 1, width: 2, backgroundColor: colors.green2, marginVertical: 2 },
  tlTitle: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink, marginTop: 3 },
  tlLatest: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.amber,
    backgroundColor: colors.amberBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tlTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink3, marginTop: 2 },
  tlUpdate: {
    marginTop: 6,
    backgroundColor: colors.amberBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4a3300',
  },
});
