import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Photo } from '@/components/complaint-bits';
import { Select } from '@/components/select';
import { Button, Chip, Icon, Notice, StatusChip, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { CATEGORIES, getCategory } from '@/data/categories';
import { canManage, canReassign } from '@/lib/access';
import { SEVERITY_LABEL, STATUS_LABEL } from '@/lib/format';
import { NEEDS_NOTE, NEXT_STATUS } from '@/lib/workflow';
import { LIMITS, useApp } from '@/store/app-store';
import type { Complaint, Severity, Status } from '@/types';

const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

/** Officer/admin actions for one complaint. Re-validated in the store actions. */
export function ManagePanel({ c, showOpenLink }: { c: Complaint; showOpenLink?: boolean }) {
  const { staff, updateStatus, updateComplaint } = useApp();
  const [publicUpdate, setPublicUpdate] = useState('');
  const [internal, setInternal] = useState(c.internalNote ?? '');
  const [message, setMessage] = useState<{ tone: 'danger' | 'info'; text: string } | null>(null);

  const cat = getCategory(c.category);
  const allowed = canManage(staff, c);
  const next = allowed ? NEXT_STATUS[c.status] : [];

  const show = (r: { ok: true } | { ok: false; error: string }, okText: string) =>
    setMessage(r.ok ? { tone: 'info', text: okText } : { tone: 'danger', text: r.error });

  const move = async (to: Status) => {
    const r = await updateStatus(c.id, to, publicUpdate);
    show(r, `Marked ${STATUS_LABEL[to].toLowerCase()}.`);
    if (r.ok) setPublicUpdate('');
  };

  const postUpdateOnly = async () => {
    if (!publicUpdate.trim()) return setMessage({ tone: 'danger', text: 'Write an update first.' });
    // A public update without a status change is recorded on the current status.
    const r = await updateStatus(c.id, c.status, publicUpdate);
    show(r, 'Update published.');
  };

  // Mapping (lat/lng are numbers from our own data, so the URL can't be injected into).
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${c.latitude.toFixed(6)},${c.longitude.toFixed(6)}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.ref}>{c.reference}</Text>
        <StatusChip status={c.status} />
        <View style={{ flex: 1 }} />
        {showOpenLink ? (
          <Pressable accessibilityRole="link" onPress={() => router.push(`/admin/complaints/${c.id}`)} hitSlop={8}>
            <Text style={styles.link}>Open full page →</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ padding: space.md, gap: space.md }}>
        <Photo uri={c.photoUri} category={c.category} style={{ height: 140 }} />
        <View>
          <Text style={styles.title}>{c.title}</Text>
          <T variant="small">{c.address}{c.locality ? ` · ${c.locality}` : ''} · {c.city}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 }}>
            <T variant="mono" style={{ fontSize: 11 }}>
              {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}{c.accuracyM ? ` · ±${c.accuracyM} m` : ''}
            </T>
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(mapUrl)} hitSlop={8}>
              <Text style={styles.link}>Open in map</Text>
            </Pressable>
          </View>
          {c.description ? <T variant="body" style={{ marginTop: space.sm, color: colors.ink2 }}>{c.description}</T> : null}
        </View>

        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <View style={[styles.cmp, { borderStyle: 'dashed', backgroundColor: '#FBFAF6' }]}>
            <T variant="caption" style={{ fontSize: 9.5 }}>AI suggested</T>
            <Text style={styles.cmpText}>{c.aiCategory ? getCategory(c.aiCategory).label : 'None'}</Text>
          </View>
          <View style={styles.cmp}>
            <T variant="caption" style={{ fontSize: 9.5 }}>Final · {cat.department}</T>
            <Text style={styles.cmpText}>{cat.label}</Text>
          </View>
        </View>

        {allowed ? (
          <>
            {canReassign(staff) ? (
              <View>
                <Text style={styles.lbl}>Category (changes the department)</Text>
                <Select
                  step={1}
                  placeholder="Category"
                  value={c.category}
                  options={CATEGORIES.map((x) => ({ value: x.code, label: `${x.label} → ${x.department}` }))}
                  onChange={(v) => show(updateComplaint(c.id, { category: v }), 'Category and department updated.')}
                />
              </View>
            ) : null}

            <View>
              <Text style={styles.lbl}>Severity (resets the SLA target)</Text>
              <View style={styles.seg}>
                {SEVERITIES.map((s, i) => (
                  <Pressable
                    key={s}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: s === c.severity }}
                    onPress={() => show(updateComplaint(c.id, { severity: s }), `Severity set to ${SEVERITY_LABEL[s]}.`)}
                    style={[styles.segItem, i < 3 && styles.segDiv, s === c.severity && styles.segOn]}>
                    <Text style={[styles.segText, s === c.severity && { color: s === 'critical' ? colors.red : '#6D4700' }]}>{SEVERITY_LABEL[s]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <View style={styles.lblRow}>
                <Icon name="eye-outline" size={14} color={colors.green7} />
                <Text style={styles.lblInline}>Public update</Text>
                <View style={{ flex: 1 }} />
                <Chip label="Citizen sees this" fg={colors.green7} bg={colors.green1} />
              </View>
              <TextInput
                multiline
                maxLength={LIMITS.note}
                value={publicUpdate}
                onChangeText={setPublicUpdate}
                placeholder={next.some((s) => NEEDS_NOTE.includes(s)) ? 'Required to resolve or reject.' : 'e.g. Crew scheduled for tomorrow morning.'}
                placeholderTextColor={colors.ink3}
                style={[styles.tx, { borderColor: colors.green2, backgroundColor: '#FAFDFB' }]}
                accessibilityLabel="Public update"
              />
            </View>

            <View>
              <View style={styles.lblRow}>
                <Icon name="lock-closed-outline" size={14} color={colors.amber} />
                <Text style={styles.lblInline}>Internal note</Text>
                <View style={{ flex: 1 }} />
                <Chip label="Staff only" fg={colors.amber} bg={colors.amberBg} />
              </View>
              <TextInput
                multiline
                maxLength={LIMITS.note}
                value={internal}
                onChangeText={setInternal}
                onBlur={() => {
                  if (internal !== (c.internalNote ?? '')) show(updateComplaint(c.id, { internalNote: internal }), 'Internal note saved.');
                }}
                placeholder="Never shown to the citizen."
                placeholderTextColor={colors.ink3}
                style={[styles.tx, { borderColor: '#E9D9B2', backgroundColor: '#FFFBF1' }]}
                accessibilityLabel="Internal note"
              />
            </View>
          </>
        ) : (
          <Notice tone="warn" icon="lock-closed-outline">This complaint belongs to another department. You can’t change it.</Notice>
        )}

        {message ? <Notice tone={message.tone} icon={message.tone === 'info' ? 'checkmark-circle-outline' : 'alert-circle-outline'}>{message.text}</Notice> : null}
      </View>

      {allowed ? (
        <View style={styles.foot}>
          {next.length === 0 ? (
            <T variant="small">No further status changes for a {STATUS_LABEL[c.status].toLowerCase()} complaint.</T>
          ) : (
            next.map((s) => (
              <Button
                key={s}
                kind={s === 'rejected' ? 'outline' : 'primary'}
                label={s === 'rejected' ? 'Reject' : `Mark ${STATUS_LABEL[s].toLowerCase()}`}
                onPress={() => move(s)}
                style={{ flex: 1, minHeight: 42 }}
              />
            ))
          )}
          {next.length > 0 ? <Button kind="ghost" label="Post update" onPress={postUpdateOnly} style={{ minHeight: 42 }} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  ref: { fontFamily: fonts.mono, fontSize: 14, color: colors.ink },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  link: { fontFamily: fonts.semibold, fontSize: 12, color: colors.green7 },
  cmp: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 8, gap: 3 },
  cmpText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
  lbl: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  lblRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  lblInline: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink2 },
  seg: { flexDirection: 'row', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.sm, overflow: 'hidden' },
  segItem: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  segDiv: { borderRightWidth: 1, borderRightColor: colors.line },
  segOn: { backgroundColor: '#FCE9C7' },
  segText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink2 },
  tx: { borderWidth: 1.5, borderRadius: radius.sm, padding: 10, minHeight: 64, fontFamily: fonts.regular, fontSize: 13, color: colors.ink, textAlignVertical: 'top' },
  foot: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#FAF8F3' },
});
