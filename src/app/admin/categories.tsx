import { Text, View } from 'react-native';

import { AdminPage, Panel, adminStyles as a, useScopedComplaints } from '@/components/admin';
import { GroupIcon } from '@/components/complaint-bits';
import { Notice, SeverityTag, T } from '@/components/ui';
import { CATEGORIES, GROUPS } from '@/data/categories';

/** Admin only (gated in admin/_layout). Read-only until categories live in Supabase. */
export default function Categories() {
  const list = useScopedComplaints();

  return (
    <AdminPage title="Categories" subtitle={`${CATEGORIES.length} categories in ${GROUPS.length} groups · each routes to one department`}>
      <Notice icon="information-circle-outline">
        Read-only for now. Adding or editing categories will write to the categories table once the backend is connected.
      </Notice>
      {GROUPS.map((g) => (
        <Panel key={g.code} title={g.label} right={`${CATEGORIES.filter((c) => c.group === g.code).length} CATEGORIES`}>
          <View style={[a.tr, a.th]}>
            <Text style={[a.thText, { flex: 1 }]}>CATEGORY</Text>
            <Text style={[a.thText, { width: 240 }]}>ROUTES TO</Text>
            <Text style={[a.thText, { width: 110 }]}>DEFAULT</Text>
            <Text style={[a.thText, { width: 90, textAlign: 'right' }]}>REPORTS</Text>
          </View>
          {CATEGORIES.filter((c) => c.group === g.code).map((c) => (
            <View key={c.code} style={a.tr}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <GroupIcon group={c.group} size={26} />
                <View style={{ flex: 1 }}>
                  <Text style={a.cellTitle}>{c.label}</Text>
                  <T variant="small" style={{ fontSize: 11 }}>{c.examples}</T>
                </View>
              </View>
              <Text style={[a.mono, { width: 240 }]}>{c.department}</Text>
              <View style={{ width: 110 }}>{c.severityHint ? <SeverityTag severity={c.severityHint} /> : <T variant="small"> - </T>}</View>
              <Text style={[a.mono, { width: 90, textAlign: 'right' }]}>{list.filter((x) => x.category === c.code).length}</Text>
            </View>
          ))}
        </Panel>
      ))}
    </AdminPage>
  );
}
