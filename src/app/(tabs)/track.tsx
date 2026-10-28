import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComplaintRow } from '@/components/complaint-bits';
import { Button, Icon, T } from '@/components/ui';
import { colors, fonts, radius, space, TOUCH } from '@/constants/theme';
import { isOpen } from '@/lib/format';
import { useApp } from '@/store/app-store';
import type { Complaint } from '@/types';

type Filter = 'all' | 'open' | 'in_progress' | 'done';

const FILTERS: { key: Filter; label: string; test: (c: Complaint) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'open', label: 'Open', test: (c) => isOpen(c.status) && c.status !== 'in_progress' },
  { key: 'in_progress', label: 'In progress', test: (c) => c.status === 'in_progress' },
  { key: 'done', label: 'Resolved', test: (c) => !isOpen(c.status) },
];

const lastActivity = (c: Complaint) => c.history[c.history.length - 1]?.at ?? c.createdAt;

export default function Track() {
  const { complaints, myComplaintIds, resetDraft } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const mine = complaints
    .filter((c) => myComplaintIds.includes(c.id))
    .sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
  const q = query.trim().toLowerCase();
  const rule = FILTERS.find((f) => f.key === filter)!;
  const shown = mine.filter(rule.test).filter((c) => !q || c.reference.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={shown}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: space.lg + 2, paddingBottom: space.xl, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ paddingTop: space.md }}>
            <T variant="display">My complaints</T>
            <View style={styles.search}>
              <Icon name="search" size={16} color={colors.ink3} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by reference or title"
                placeholderTextColor={colors.ink3}
                style={styles.searchInput}
                autoCapitalize="characters"
                accessibilityLabel="Search complaints"
              />
            </View>
            <View style={styles.filters}>
              {FILTERS.map((f) => {
                const on = f.key === filter;
                const count = f.key === 'all' ? ` · ${mine.length}` : '';
                return (
                  <Pressable
                    key={f.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setFilter(f.key)}
                    style={[styles.filter, on && styles.filterOn]}>
                    <Text style={[styles.filterText, on && { color: '#fff' }]}>{f.label}{count}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <ComplaintRow complaint={item} last={index === shown.length - 1} onPress={() => router.push(`/complaint/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="document-text-outline" size={36} color={colors.ink3} />
            <T variant="heading" style={{ marginTop: space.sm }}>
              {mine.length === 0 ? 'No complaints yet' : 'Nothing matches'}
            </T>
            <T variant="small" style={{ textAlign: 'center', marginTop: 4 }}>
              {mine.length === 0 ? 'Report an issue and track it here.' : 'Try a different filter or search.'}
            </T>
            {mine.length === 0 ? (
              <Button
                label="Report an issue"
                icon="camera-outline"
                style={{ marginTop: space.lg, alignSelf: 'stretch' }}
                onPress={() => {
                  resetDraft();
                  router.push('/complaint/new');
                }}
              />
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: space.md,
    minHeight: TOUCH,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.ink, paddingVertical: 8 },
  filters: { flexDirection: 'row', gap: 6, marginTop: space.md, marginBottom: space.xs, flexWrap: 'wrap' },
  filter: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  filterOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.xxl },
});
