import { Text, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a, useScopedComplaints } from '@/components/admin';
import { Notice, SeverityTag, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { isOpen, isOverdue, SLA_HOURS, SLA_LABEL } from '@/lib/format';
import type { Severity } from '@/types';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

/** Admin only (gated in admin/_layout). Read-only until sla_policies lives in Supabase. */
export default function SlaPolicies() {
  const list = useScopedComplaints();

  return (
    <AdminPage title="SLA policies" subtitle="Target resolution time by severity, counted from submission">
      <Notice icon="information-circle-outline">
        Read-only for now. Editing will update the sla_policies table once the backend is connected. Changing a complaint’s severity
        recalculates its due time from the original submission time.
      </Notice>
      <Panel>
        <View style={[a.tr, a.th]}>
          <Text style={[a.thText, { width: 140 }]}>SEVERITY</Text>
          <Text style={[a.thText, { width: 140 }]}>TARGET</Text>
          <Text style={[a.thText, { width: 120 }]}>HOURS</Text>
          <Text style={[a.thText, { width: 120, textAlign: 'right' }]}>OPEN</Text>
          <Text style={[a.thText, { flex: 1, textAlign: 'right' }]}>OVERDUE NOW</Text>
        </View>
        {SEVERITIES.map((s) => {
          const open = list.filter((c) => c.severity === s && isOpen(c.status)).length;
          const late = list.filter((c) => c.severity === s && isOverdue(c.createdAt, c.severity, c.status)).length;
          return (
            <View key={s} style={a.tr}>
              <View style={{ width: 140 }}><SeverityTag severity={s} /></View>
              <Text style={[a.cellTitle, { width: 140 }]}>{SLA_LABEL[s]}</Text>
              <Text style={[a.mono, { width: 120 }]}>{SLA_HOURS[s]} h</Text>
              <Text style={[a.mono, { width: 120, textAlign: 'right' }]}>{open}</Text>
              <Text style={[a.mono, { flex: 1, textAlign: 'right', color: late ? colors.red : colors.ink2 }]}>{late}</Text>
            </View>
          );
        })}
      </Panel>
      <T variant="small">Critical severity is a triage priority, not an emergency dispatch.</T>
    </AdminPage>
  );
}
