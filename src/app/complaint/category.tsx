import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GroupIcon } from "@/components/complaint-bits";
import { Screen } from "@/components/screen";
import { Icon, Notice, T, TopBar } from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import {
  CATEGORIES,
  GROUPS,
  getGroup,
  type GroupCode,
} from "@/data/categories";
import { useApp } from "@/store/app-store";

/** Manual category picker: group first, then category (PRD Screen 6 fallback). */
export default function CategoryPicker() {
  const { draft, updateDraft } = useApp();
  const preset = (
    draft.category
      ? CATEGORIES.find((c) => c.code === draft.category)?.group
      : draft.presetGroup
  ) as GroupCode | undefined;
  const [group, setGroup] = useState<GroupCode | null>(preset ?? null);

  const pick = (code: string) => {
    const c = CATEGORIES.find((x) => x.code === code)!;
    updateDraft({
      category: c.code,
      // Title follows the category until the citizen writes their own.
      title: draft.titleEdited ? draft.title : c.label,
      severity: c.severityHint ?? draft.severity,
    });
    router.back();
  };

  const items = group ? CATEGORIES.filter((c) => c.group === group) : [];
  const groupHasCritical = items.some((c) => c.severityHint === "critical");

  return (
    <Screen>
      <TopBar
        title="Choose a category"
        onBack={group && !preset ? () => setGroup(null) : undefined}
      />

      {!group ? (
        <>
          <T variant="small" style={{ marginBottom: space.md }}>
            Step 1 of 2 · What kind of issue is it?
          </T>
          <View style={{ gap: space.sm }}>
            {GROUPS.map((g) => (
              <Pressable
                key={g.code}
                accessibilityRole="button"
                onPress={() => setGroup(g.code)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                ]}
              >
                <GroupIcon group={g.code} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{g.label}</Text>
                  <T variant="small" style={{ fontSize: 11.5 }}>
                    {CATEGORIES.filter((c) => c.group === g.code).length}{" "}
                    categories
                  </T>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.ink3} />
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.stepRow}>
            <View>
              <T variant="small" style={{ fontSize: 11.5 }}>
                Step 2 of 2
              </T>
              <Text style={styles.groupTitle}>{getGroup(group).label}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setGroup(null)}
              hitSlop={8}
            >
              <Text style={styles.link}>Change type</Text>
            </Pressable>
          </View>
          <View style={{ gap: space.sm }}>
            {items.map((c) => {
              const on = c.code === draft.category;
              return (
                <Pressable
                  key={c.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => pick(c.code)}
                  style={({ pressed }) => [
                    styles.option,
                    on && styles.optionOn,
                    pressed && styles.pressed,
                  ]}
                >
                  {on ? (
                    <View style={styles.check}>
                      <Icon name="checkmark" size={16} color={colors.green7} />
                    </View>
                  ) : (
                    <GroupIcon group={c.group} size={32} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optTitle}>{c.label}</Text>
                    <T variant="small" style={{ fontSize: 11.5 }}>
                      {c.examples}
                    </T>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {groupHasCritical ? (
            <View style={{ marginTop: space.md }}>
              <Notice tone="danger" icon="shield-outline">
                {"CivicLens isn't an emergency service. If anyone is in danger,"}
                call 112.
              </Notice>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: "#fff",
  },
  optionOn: {
    borderWidth: 1.5,
    borderColor: colors.green7,
    backgroundColor: colors.green1,
  },
  pressed: { backgroundColor: colors.green1 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optTitle: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  groupTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  link: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.green7 },
});
