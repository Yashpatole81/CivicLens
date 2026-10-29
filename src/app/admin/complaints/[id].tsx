import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a } from '@/components/admin';
import { ManagePanel } from '@/components/admin-manage';
import { Timeline } from '@/components/complaint-bits';
import { Chip, Icon, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { canView } from '@/lib/access';
import { dueAt, formatDateTime, formatDuration, isOpen, isOverdue, SEVERITY_LABEL, SLA_LABEL } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function AdminComplaint() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getComplaint, staff } = useApp();
  const { width } = useWindowDimensions();
  const [now] = useState(() => Date.now());
  const c = id ? getComplaint(id) : undefined;

  // Same "not found" message whether it doesn't exist or belongs to another department.
  if (!c || !canView(staff, c)) {
    return (
      <AdminPage title="Complaint not found">
        <T variant="small">{"It doesn't exist, or it isn't assigned to your department."}</T>
        <Back />
      </AdminPage>
    );
  }

  const due = dueAt(c.createdAt, c.severity);
  const late = isOverdue(c.createdAt, c.severity, c.status, new Date(now));
  const wide = width >= 1150;

  return (
    <AdminPage title={c.reference} subtitle={`${c.title} · ${c.department}`}>
      <Back />
      <View style={[a.row, { flexWrap: wide ? 'nowrap' : 'wrap' }]}>
        <View style={{ flex: 1, minWidth: 340, gap: space.md }}>
          <Panel title="SLA">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
              <Info k="Severity" v={`${SEVERITY_LABEL[c.severity]} · ${SLA_LABEL[c.severity]} target`} />
              <Info k="Submitted" v={formatDateTime(c.createdAt)} />
              <Info k={isOpen(c.status) ? 'Due by' : 'Was due by'} v={formatDateTime(due)} danger={late} />
              {c.resolvedAt ? <Info k="Resolved in" v={formatDuration(c.createdAt, c.resolvedAt)} /> : null}
            </View>
            {late ? <View style={{ marginTop: space.md }}><Chip label="Overdue" fg={colors.red} bg={colors.redBg} dot /></View> : null}
          </Panel>

          <Panel title="Status history" right="CITIZEN-VISIBLE UPDATES">
            <Timeline history={c.history} pendingResolved={isOpen(c.status)} />
          </Panel>

          {c.rejectionReason ? (
            <Panel title="Rejection reason">
              <T variant="body">{c.rejectionReason}</T>
            </Panel>
          ) : null}
        </View>

        <View style={{ width: wide ? 420 : '100%' }}>
          <ManagePanel key={c.id} c={c} />
        </View>
      </View>
    </AdminPage>
  );
}

function Info({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <View style={{ minWidth: 150 }}>
      <T variant="caption" style={{ fontSize: 9.5 }}>{k}</T>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: danger ? colors.red : colors.ink, marginTop: 2 }}>{v}</Text>
    </View>
  );
}

function Back() {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin/complaints'))}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
      <Icon name="chevron-back" size={16} color={colors.green7} />
      <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.green7 }}>All complaints</Text>
    </Pressable>
  );
}
