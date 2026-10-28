import { Pressable, Text, View } from 'react-native';

import { adminStyles as a } from '@/components/admin';
import { Chip, SeverityTag, StatusChip, T } from '@/components/ui';
import { colors, space } from '@/constants/theme';
import { dueAt, formatDateTime, isOpen, isOverdue } from '@/lib/format';
import type { Complaint } from '@/types';

/** Complaint queue table used on the dashboard and the Complaints page. */
export function QueueTable({
  rows,
  now,
  selectedId,
  onSelect,
}: {
  rows: Complaint[];
  now: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View>
      <View style={[a.tr, a.th]}>
        <Text style={[a.thText, { width: 130 }]}>REFERENCE</Text>
        <Text style={[a.thText, { flex: 1 }]}>COMPLAINT</Text>
        <Text style={[a.thText, { width: 90 }]}>SEVERITY</Text>
        <Text style={[a.thText, { width: 120 }]}>STATUS</Text>
        <Text style={[a.thText, { width: 130 }]}>DUE (SLA)</Text>
      </View>
      {rows.length === 0 ? <T variant="small" style={{ padding: space.md }}>No complaints match.</T> : null}
      {rows.map((c) => {
        const late = isOverdue(c.createdAt, c.severity, c.status, new Date(now));
        const hoursLate = Math.round((now - dueAt(c.createdAt, c.severity).getTime()) / 3600000);
        const on = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${c.reference}, ${c.title}`}
            onPress={() => onSelect(c.id)}
            style={[a.tr, on && { backgroundColor: colors.green1, borderLeftWidth: 3, borderLeftColor: colors.green7 }]}>
            <Text style={[a.mono, { width: 130 }]}>{c.reference}</Text>
            <View style={{ flex: 1, paddingRight: space.sm }}>
              <Text style={a.cellTitle} numberOfLines={1}>{c.title}</Text>
              <T variant="small" style={{ fontSize: 11 }} numberOfLines={1}>
                {c.department} · {c.locality ?? c.city}
              </T>
            </View>
            <View style={{ width: 90 }}><SeverityTag severity={c.severity} /></View>
            <View style={{ width: 120 }}><StatusChip status={c.status} /></View>
            <View style={{ width: 130 }}>
              {late ? (
                <Chip label={`Overdue ${hoursLate} h`} fg={colors.red} bg={colors.redBg} dot />
              ) : (
                <Text style={a.mono}>{isOpen(c.status) ? formatDateTime(dueAt(c.createdAt, c.severity)) : '—'}</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
