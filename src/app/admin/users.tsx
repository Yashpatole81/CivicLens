import { Text, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a } from '@/components/admin';
import { Chip, Notice, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { DEMO_STAFF, type StaffRole } from '@/data/mock';
import { useApp } from '@/store/app-store';

const ROLE_COLORS: Record<StaffRole, [string, string]> = {
  admin: [colors.paper, colors.ink],
  officer: [colors.blue, colors.blueBg],
  citizen: [colors.neutral, colors.neutralBg],
};

/** Admin only (gated in admin/_layout). */
export default function Users() {
  const { staff } = useApp();

  return (
    <AdminPage title="Users & roles" subtitle={`${DEMO_STAFF.length} registered staff accounts`}>
      <Notice tone="info" icon="shield-checkmark-outline">
        Municipal staff accounts and departmental officer roles for Pune Municipal Corporation.
      </Notice>
      <Panel>
        <View style={[a.tr, a.th]}>
          <Text style={[a.thText, { flex: 1 }]}>NAME</Text>
          <Text style={[a.thText, { width: 240 }]}>EMAIL</Text>
          <Text style={[a.thText, { width: 110 }]}>ROLE</Text>
          <Text style={[a.thText, { width: 240 }]}>DEPARTMENT</Text>
        </View>
        {DEMO_STAFF.map((u) => {
          const [fg, bg] = ROLE_COLORS[u.role];
          return (
            <View key={u.id} style={a.tr}>
              <View style={{ flex: 1 }}>
                <Text style={a.cellTitle}>{u.name}{u.id === staff?.id ? '  (you)' : ''}</Text>
              </View>
              <Text style={[a.mono, { width: 240 }]}>{u.email}</Text>
              <View style={{ width: 110 }}><Chip label={u.role.toUpperCase()} fg={fg} bg={bg} /></View>
              <Text style={[a.mono, { width: 240 }]}>{u.department ?? (u.role === 'admin' ? 'All departments' : ' - ')}</Text>
            </View>
          );
        })}
      </Panel>
      <T variant="small">Citizens sign up in the mobile app. Department officers and administrators are assigned by municipal administrators.</T>
    </AdminPage>
  );
}
