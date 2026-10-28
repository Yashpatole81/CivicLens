import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AdminPage, BarRow, Kpi, Panel, adminStyles as a, useScopedComplaints } from '@/components/admin';
import { T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { GROUPS, getCategory } from '@/data/categories';
import { dueAt, formatDuration, isOpen, SEVERITY_LABEL, STATUS_LABEL } from '@/lib/format';
import type { Severity, Status } from '@/types';

const DAYS = 14;
const STATUSES: Status[] = ['submitted', 'assigned', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'];
const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

/** Charts are plain Views (no chart library needed). */
export default function Analytics() {
  const list = useScopedComplaints();
  const [now] = useState(() => Date.now());

  const done = list.filter((c) => c.resolvedAt);
  const onTime = done.filter((c) => new Date(c.resolvedAt!) <= dueAt(c.createdAt, c.severity)).length;
  const avgMs = done.length
    ? done.reduce((s, c) => s + new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime(), 0) / done.length
    : 0;
  const aiRated = list.filter((c) => c.aiCategory);
  const aiAgree = aiRated.filter((c) => c.aiCategory === c.category).length;

  // Submissions per day, last 14 days.
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const start = startOfToday.getTime() - (DAYS - 1 - i) * 86400000;
    const n = list.filter((c) => {
      const t = new Date(c.createdAt).getTime();
      return t >= start && t < start + 86400000;
    }).length;
    return { start, n };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));

  const byGroup = GROUPS.map((g) => ({ g, n: list.filter((c) => getCategory(c.category).group === g.code).length }));
  const maxGroup = Math.max(1, ...byGroup.map((x) => x.n));
  const maxStatus = Math.max(1, ...STATUSES.map((s) => list.filter((c) => c.status === s).length));

  return (
    <AdminPage title="Analytics" subtitle="Calculated from the complaints in your scope">
      <View style={a.row}>
        <Kpi label="Open now" value={list.filter((c) => isOpen(c.status)).length} />
        <Kpi label="Resolved on time" value={done.length ? `${Math.round((onTime / done.length) * 100)}%` : '—'} sub={`${onTime} of ${done.length}`} bar={colors.green5} />
        <Kpi label="Avg. resolution time" value={done.length ? formatDuration(new Date(0).toISOString(), new Date(avgMs).toISOString()) : '—'} bar={colors.blue} />
        <Kpi label="AI category kept" value={aiRated.length ? `${Math.round((aiAgree / aiRated.length) * 100)}%` : '—'} sub={`${aiAgree} of ${aiRated.length} with an AI suggestion`} bar={colors.violet} />
      </View>

      <Panel title="New complaints per day" right={`LAST ${DAYS} DAYS`}>
        <View style={styles.chart} accessibilityLabel="New complaints per day chart">
          {days.map((d) => {
            const date = new Date(d.start);
            return (
              <View key={d.start} style={styles.col}>
                <Text style={styles.colNum}>{d.n || ''}</Text>
                <View style={[styles.colBar, { height: `${(d.n / maxDay) * 100}%`, minHeight: d.n ? 4 : 0 }]} />
                <Text style={styles.colLabel}>{date.getDate()}/{date.getMonth() + 1}</Text>
              </View>
            );
          })}
        </View>
      </Panel>

      <View style={a.row}>
        <Panel title="By issue type" style={{ flex: 1, minWidth: 320 }}>
          {byGroup.map(({ g, n }) => (
            <BarRow key={g.code} label={g.label} value={n} max={maxGroup} color={g.tint} />
          ))}
        </Panel>
        <Panel title="By status" style={{ flex: 1, minWidth: 320 }}>
          {STATUSES.map((s) => (
            <BarRow key={s} label={STATUS_LABEL[s]} value={list.filter((c) => c.status === s).length} max={maxStatus} />
          ))}
        </Panel>
        <Panel title="By severity" style={{ flex: 1, minWidth: 260 }}>
          {SEVERITIES.map((s) => (
            <BarRow
              key={s}
              label={SEVERITY_LABEL[s]}
              value={list.filter((c) => c.severity === s).length}
              max={Math.max(1, list.length)}
              color={s === 'critical' ? colors.red : s === 'high' ? '#C98A10' : colors.green7}
            />
          ))}
        </Panel>
      </View>
      <T variant="small">AI category kept = how often the final category matched the AI suggestion (PRD AI Spec §11).</T>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 6, paddingTop: space.md },
  col: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  colBar: { width: '70%', backgroundColor: colors.green7, borderTopLeftRadius: radius.sm / 2, borderTopRightRadius: radius.sm / 2 },
  colNum: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.ink2, marginBottom: 2 },
  colLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink3, marginTop: 4 },
});
