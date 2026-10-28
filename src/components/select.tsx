import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { colors, fonts, radius, space, TOUCH } from '@/constants/theme';

export type Option = { value: string; label: string };

type Props = {
  step: number;
  placeholder: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

/** Searchable dropdown used for the cascading Country → State → City picker. */
export function Select({ step, placeholder, value, options, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `${placeholder}: ${selected.label}` : placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, disabled && styles.disabled, selected && styles.filled]}>
        <Text style={styles.step}>{step}</Text>
        <Text style={[styles.value, !selected && { color: colors.ink3 }]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="chevron-down" size={16} color={colors.ink3} />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <Text style={styles.title}>{placeholder}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setOpen(false)} hitSlop={10}>
              <Icon name="close" size={24} />
            </Pressable>
          </View>
          <View style={styles.search}>
            <Icon name="search" size={16} color={colors.ink3} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={colors.ink3}
              style={styles.searchInput}
              accessibilityLabel={`Search ${placeholder}`}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(item.value);
                  setQuery('');
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.green1 }]}>
                <Text style={styles.rowText}>{item.label}</Text>
                {item.value === value ? <Icon name="checkmark" color={colors.green7} /> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: TOUCH,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  filled: { borderColor: colors.green2 },
  disabled: { backgroundColor: colors.line2 },
  step: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    color: colors.green7,
    borderWidth: 1,
    borderColor: colors.green2,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#fff',
  },
  value: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  search: {
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    minHeight: TOUCH,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink, paddingVertical: 8 },
  row: {
    minHeight: 50,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  rowText: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink },
  empty: { textAlign: 'center', padding: space.xl, fontFamily: fonts.regular, color: colors.ink3 },
});
