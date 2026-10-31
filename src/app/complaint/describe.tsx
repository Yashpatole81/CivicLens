import { router } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { GroupIcon, Photo } from "@/components/complaint-bits";
import { Screen } from "@/components/screen";
import {
  Button,
  Chip,
  Icon,
  Notice,
  SeverityTag,
  Stepper,
  T,
  TopBar,
} from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import { getCategory, getGroup } from "@/data/categories";
import { suggestIssue } from "@/lib/ai";
import { useApp } from "@/store/app-store";

const MAX_DESCRIPTION = 500;

export default function Describe() {
  const { draft, updateDraft } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const suggestion = draft.suggestion;
  const category = draft.category ? getCategory(draft.category) : null;
  // The chosen category came from the AI only if it still matches the suggestion.
  const fromAi =
    suggestion?.source === "model" && suggestion.category === draft.category;

  const analyze = useCallback(async () => {
    setAnalyzing(true);
    try {
      const s = await suggestIssue(draft.description, draft.photoUri);
      updateDraft(
        s.source === "model"
          ? {
              suggestion: s,
              category: s.category,
              title: draft.titleEdited ? draft.title : s.title,
              severity: s.severity,
            }
          : { suggestion: s },
      );
    } finally {
      setAnalyzing(false);
    }
  }, [
    draft.description,
    draft.photoUri,
    draft.titleEdited,
    draft.title,
    updateDraft,
  ]);

  useEffect(() => {
    let active = true;
    if (draft.photoUri && !draft.category && !draft.suggestion) {
      const timer = setTimeout(() => {
        if (active) {
          analyze();
        }
      }, 150);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [draft.photoUri, draft.category, draft.suggestion, analyze]);

  return (
    <Screen
      footer={
        <Button
          label={category ? "Review complaint" : "Choose a category"}
          onPress={() =>
            router.push(category ? "/complaint/review" : "/complaint/category")
          }
        />
      }
    >
      <TopBar title="New complaint" />
      <Stepper step={2} />

      <View style={styles.mini}>
        <Photo
          uri={draft.photoUri}
          category={draft.category ?? "other"}
          style={styles.thumb}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Ok label="Photo added" />
          <Ok label={draft.location?.address ?? "Location captured"} />
        </View>
      </View>

      <Text style={styles.label}>
        Describe it{" "}
        <Text style={{ fontFamily: fonts.regular, color: colors.ink3 }}>
          (optional)
        </Text>
      </Text>
      <View style={styles.textarea}>
        <TextInput
          multiline
          maxLength={MAX_DESCRIPTION}
          value={draft.description}
          onChangeText={(description) => updateDraft({ description })}
          placeholder="e.g. Large pothole near the bus stop, bikes keep swerving around it."
          placeholderTextColor={colors.ink3}
          style={styles.textareaInput}
          accessibilityLabel="Describe the issue"
        />
        <Text style={styles.count}>
          {draft.description.length}/{MAX_DESCRIPTION}
        </Text>
      </View>

      <View style={styles.ai}>
        <View style={styles.aiHead}>
          <Icon name="sparkles-outline" size={16} color={colors.green8} />
          <Text style={styles.aiTitle}>
            {category && !fromAi ? "Your category" : "AI suggestion"}
          </Text>
          <View style={{ flex: 1 }} />
          {fromAi ? (
            <Chip label="Please check" fg={colors.amber} bg="#fff" />
          ) : null}
          {category && !fromAi ? (
            <Chip label="Chosen by you" fg={colors.green7} bg="#fff" />
          ) : null}
        </View>

        <View style={{ padding: space.md }}>
          {analyzing ? (
            <View style={styles.row}>
              <ActivityIndicator color={colors.green7} />
              <T variant="small">Meta Muse Spark AI analysing photo...</T>
            </View>
          ) : category ? (
            <>
              <View style={styles.catHead}>
                <GroupIcon group={category.group} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.catTitle}>{category.label}</Text>
                  <T variant="small" style={{ fontSize: 11.5 }}>
                    {getGroup(category.group).label}
                  </T>
                </View>
              </View>
              <Kv
                label="Severity"
                node={<SeverityTag severity={draft.severity} />}
              />
              <Kv
                label="Goes to"
                value={category.department}
                last={!suggestion?.observations?.length}
              />
              {suggestion?.observations && suggestion.observations.length > 0 ? (
                <View style={{ marginTop: space.xs, paddingTop: space.xs }}>
                  <T
                    variant="caption"
                    style={{ color: colors.ink3, marginBottom: 2 }}
                  >
                    AI Observations:
                  </T>
                  {suggestion.observations.map((obs, idx) => (
                    <T
                      key={idx}
                      variant="small"
                      style={{
                        fontSize: 11,
                        color: colors.ink2,
                        lineHeight: 15,
                      }}
                    >
                      • {obs}
                    </T>
                  ))}
                </View>
              ) : null}
            </>
          ) : suggestion?.source === "fallback" ? (
            <Notice tone="warn" icon="information-circle-outline">
              {"We couldn't work out the issue type automatically. Please pick a"}
              category.
            </Notice>
          ) : (
            <T variant="small">
              Add a short description, then tap Analyse. Or pick a category
              yourself.
            </T>
          )}
        </View>

        {!analyzing ? (
          <View style={styles.aiActions}>
            <Button
              kind="outline"
              label={suggestion ? "Analyse again" : "Analyse"}
              icon="sparkles-outline"
              onPress={analyze}
              style={{ flex: 1 }}
            />
            <Button
              kind="outline"
              label={category ? "Change category" : "Pick category"}
              onPress={() => router.push("/complaint/category")}
              style={{ flex: 1 }}
            />
          </View>
        ) : null}
      </View>

      <T variant="mono" style={{ fontSize: 10, marginTop: space.sm }}>
        POWERED BY META MUSE SPARK OPEN (BASETEN) · MULTIMODAL VISION REASONING

      </T>
    </Screen>
  );
}

function Ok({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Icon name="checkmark" size={14} color={colors.green7} />
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 12,
          color: colors.green7,
          flex: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function Kv({
  label,
  value,
  node,
  last,
}: {
  label: string;
  value?: string;
  node?: ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.kv, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.kvLabel}>{label}</Text>
      <View style={{ flex: 1 }}>
        {node ?? <Text style={styles.kvValue}>{value}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mini: { flexDirection: "row", gap: space.md, alignItems: "center" },
  thumb: { width: 60, height: 60, borderRadius: 10 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink2,
    marginTop: space.lg,
    marginBottom: 6,
  },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  textareaInput: {
    minHeight: 76,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlignVertical: "top",
  },
  count: {
    position: "absolute",
    right: 10,
    bottom: 6,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: colors.ink3,
  },
  ai: {
    marginTop: space.lg,
    borderWidth: 1.5,
    borderColor: colors.green2,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  aiHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    backgroundColor: colors.green1,
  },
  aiTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.green8 },
  aiActions: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.sm,
  },
  catHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingBottom: space.sm,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  catTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  kv: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  kvLabel: {
    width: 84,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.ink3,
  },
  kvValue: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
});
