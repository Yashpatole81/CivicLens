import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a, useScopedComplaints } from '@/components/admin';
import { QueueTable } from '@/components/queue-table';
import { Icon, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { GROUPS, getCategory, type GroupCode } from '@/data/categories';
import { dueAt, isOpen, isOverdue, SEVERITY_LABEL, STATUS_LABEL } from '@/lib/format';
import type { Severity, Status } from '@/types';

type StatusFilter = 'open' | 'all' | 'overdue' | Status;
type Sort = 'newest' | 'oldest' | 'severity' | 'due';

const STATUS_FILTERS: StatusFilter[] = ['open', 'overdue', 'all', 'submitted', 'assigned', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'];
const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SORTS: { key: Sort; label: string }[] = [
  { key: 'due', label: 'Due soonest' },
  { key: 'severity', label: 'Severity' },
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
];

export default function ComplaintsPage() {
  const list = useScopedComplaints();
  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('open');
  const [group, setGroup] = useState<GroupCode | 'all'>('all');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [sort, setSort] = useState<Sort>('due');

  const nowDate = new Date(now);
  const q = query.trim().toLowerCase();
  const rows = list
    .filter((c) => {
      if (status === 'open') return isOpen(c.status);
      if (status === 'overdue') return isOverdue(c.createdAt, c.severity, c.status, nowDate);
      if (status === 'all') return true;
      return c.status === status;
    })
    .filter((c) => group === 'all' || getCategory(c.category).group === group)
    .filter((c) => severity === 'all' || c.severity === severity)
    .filter((c) => !q || c.reference.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || (c.locality ?? '').toLowerCase().includes(q))
    .sort((x, y) => {
      if (sort === 'newest') return y.createdAt.localeCompare(x.createdAt);
      if (sort === 'oldest') return x.createdAt.localeCompare(y.createdAt);
      if (sort === 'severity') return SEV_RANK[x.severity] - SEV_RANK[y.severity];
      // due: open ones first, then by SLA due time
      const ox = isOpen(x.status) ? 0 : 1;
      const oy = isOpen(y.status) ? 0 : 1;
      return ox - oy || dueAt(x.createdAt, x.severity).getTime() - dueAt(y.createdAt, y.severity).getTime();
    });

  return (
    <AdminPage title="Complaints" subtitle={`${rows.length} of ${list.length} complaints in your scope`}>
      <Panel>
        <View style={styles.search}>
          <Icon name="search" size={15} color={colors.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            maxLength={80}
            placeholder="Search reference, title or area"
            placeholderTextColor={colors.ink3}
            style={styles.searchInput}
            accessibilityLabel="Search complaints"
          />
        </View>

        <FilterRow label="Status">
          {STATUS_FILTERS.map((f) => (
            <Pill key={f} on={status === f} onPress={() => setStatus(f)}
              label={f === 'open' ? 'Open' : f === 'all' ? 'All' : f === 'overdue' ? 'Overdue' : STATUS_LABEL[f]} />
          ))}
        </FilterRow>
        <FilterRow label="Type">
          <Pill on={group === 'all'} onPress={() => setGroup('all')} label="All" />
          {GROUPS.map((g) => (
            <Pill key={g.code} on={group === g.code} onPress={() => setGroup(g.code)} label={g.shortLabel} />
          ))}
        </FilterRow>
        <FilterRow label="Severity">
          <Pill on={severity === 'all'} onPress={() => setSeverity('all')} label="All" />
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <Pill key={s} on={severity === s} onPress={() => setSeverity(s)} label={SEVERITY_LABEL[s]} />
          ))}
        </FilterRow>
        <FilterRow label="Sort">
          {SORTS.map((s) => (
            <Pill key={s.key} on={sort === s.key} onPress={() => setSort(s.key)} label={s.label} />
          ))}
        </FilterRow>
      </Panel>

      <Panel>
        <QueueTable rows={rows} now={now} selectedId={null} onSelect={(id) => router.push(`/admin/complaints/${id}`)} />
      </Panel>
    </AdminPage>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterRow}>
      <T variant="caption" style={{ width: 70 }}>{label}</T>
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View>
    </View>
  );
}

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[a.pill, on && a.pillOn]}>
      <Text style={[a.pillText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    maxWidth: 420,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    marginBottom: space.sm,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.ink, outlineStyle: 'none' } as never,
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
});
