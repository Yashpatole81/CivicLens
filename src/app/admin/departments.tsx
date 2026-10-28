import { useState } from 'react';
import { Text, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a, useScopedComplaints } from '@/components/admin';
import { T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { DEMO_STAFF } from '@/data/mock';
import { isAdmin } from '@/lib/access';
import { dueAt, formatDuration, isOpen, isOverdue } from '@/lib/format';
import { useApp } from '@/store/app-store';

/** Department performance from stored complaints (PRD FR-ADMIN-001). */
export default function Departments() {
  const { staff } = useApp();
  const list = useScopedComplaints();
  const [now] = useState(() => Date.now());
  const nowDate = new Date(now);

  // Officers only see their own department; admins see all.
  const departments = isAdmin(staff) ? [...new Set(CATEGORIES.map((c) => c.department))] : staff?.department ? [staff.department] : [];
  const rows = departments
    .map((dept) => {
      const items = list.filter((c) => c.department === dept);
      const done = items.filter((c) => c.resolvedAt);
      const onTime = done.filter((c) => new Date(c.resolvedAt!) <= dueAt(c.createdAt, c.severity)).length;
      const avgHours = done.length
        ? done.reduce((s, c) => s + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()), 0) / done.length / 3600000
        : null;
      return {
        dept,
        total: items.length,
        open: items.filter((c) => isOpen(c.status)).length,
        late: items.filter((c) => isOverdue(c.createdAt, c.severity, c.status, nowDate)).length,
        resolved: done.length,
        onTimePct: done.length ? Math.round((onTime / done.length) * 100) : null,
        avg: avgHours != null ? formatDuration(new Date(0).toISOString(), new Date(avgHours * 3600000).toISOString()) : '—',
        officers: DEMO_STAFF.filter((s) => s.department === dept).length,
        categories: CATEGORIES.filter((c) => c.department === dept).length,
      };
    })
    .sort((x, y) => y.open - x.open || y.total - x.total);

  return (
    <AdminPage title="Departments" subtitle="Workload and SLA performance, calculated from stored complaints">
      <Panel>
        <View style={[a.tr, a.th]}>
          <Text style={[a.thText, { flex: 1 }]}>DEPARTMENT</Text>
          <Text style={[a.thText, { width: 70, textAlign: 'right' }]}>OPEN</Text>
          <Text style={[a.thText, { width: 80, textAlign: 'right' }]}>OVERDUE</Text>
          <Text style={[a.thText, { width: 90, textAlign: 'right' }]}>RESOLVED</Text>
          <Text style={[a.thText, { width: 100, textAlign: 'right' }]}>ON TIME</Text>
          <Text style={[a.thText, { width: 110, textAlign: 'right' }]}>AVG TIME</Text>
          <Text style={[a.thText, { width: 90, textAlign: 'right' }]}>OFFICERS</Text>
        </View>
        {rows.map((r) => (
          <View key={r.dept} style={a.tr}>
            <View style={{ flex: 1 }}>
              <Text style={a.cellTitle}>{r.dept}</Text>
              <T variant="small" style={{ fontSize: 11 }}>{r.categories} categories · {r.total} complaints</T>
            </View>
            <Text style={[a.mono, { width: 70, textAlign: 'right' }]}>{r.open}</Text>
            <Text style={[a.mono, { width: 80, textAlign: 'right', color: r.late ? colors.red : colors.ink2 }]}>{r.late}</Text>
            <Text style={[a.mono, { width: 90, textAlign: 'right' }]}>{r.resolved}</Text>
            <Text style={[a.mono, { width: 100, textAlign: 'right' }]}>{r.onTimePct == null ? '—' : `${r.onTimePct}%`}</Text>
            <Text style={[a.mono, { width: 110, textAlign: 'right' }]}>{r.avg}</Text>
            <Text style={[a.mono, { width: 90, textAlign: 'right' }]}>{r.officers}</Text>
          </View>
        ))}
      </Panel>
    </AdminPage>
  );
}
