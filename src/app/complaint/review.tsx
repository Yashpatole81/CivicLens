import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Photo } from "@/components/complaint-bits";
import { Screen } from "@/components/screen";
import { Button, Card, Icon, Notice, Stepper, T, TopBar } from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import { getCategory } from "@/data/categories";
import { CITIES } from "@/data/locations";
import { SEVERITY_LABEL, SLA_LABEL } from "@/lib/format";
import { useApp } from "@/store/app-store";
import type { Severity } from "@/types";

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

export default function Review() {
  const { draft, updateDraft, submitDraft, user } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false); // blocks double taps before state re-renders

  const category = getCategory(draft.category ?? "other");
  const loc = draft.location;

  // City rule (PRD DB §3.0): GPS city if it's a known city, else the profile city.
  const gpsCity =
    loc?.city &&
    CITIES.some((c) => c.name.toLowerCase() === loc.city!.toLowerCase())
      ? loc.city
      : null;
  const city = gpsCity ?? user?.city ?? "";
  const outsideLimits = !gpsCity;
  const otherCity =
    gpsCity && user && gpsCity.toLowerCase() !== user.city.toLowerCase();

  const valid =
    !!draft.photoUri &&
    !!loc &&
    !!draft.category &&
    draft.title.trim().length >= 3;

  const onSubmit = async () => {
    if (locked.current || !valid) return;
    locked.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const c = await submitDraft();
      router.replace({ pathname: "/complaint/submitted", params: { id: c.id } });
    } catch {
      setError("We couldn't submit your complaint. Please try again.");
      locked.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={submitting ? "Submitting..." : "Submit complaint"}
          loading={submitting}
          disabled={!valid}
          onPress={onSubmit}
        />
      }
    >
      <TopBar title="Review & submit" />
      <Stepper step={3} />

      <Photo
        uri={draft.photoUri}
        category={category.code}
        style={{ height: 120 }}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.k}>Title</Text>
          <TextInput
            value={draft.title}
            onChangeText={(title) => updateDraft({ title })}
            maxLength={140}
            placeholder="Short title"
            placeholderTextColor={colors.ink3}
            style={styles.titleInput}
            accessibilityLabel="Complaint title"
          />
        </View>
        <Icon name="create-outline" size={16} color={colors.green7} />
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.k}>Category</Text>
          <Text style={styles.v}>{category.label}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/complaint/category")}
          hitSlop={10}
        >
          <Text style={styles.link}>Change</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.row,
          { display: "flex", flexDirection: "column", alignItems: "stretch" },
        ]}
      >
        <Text style={styles.k}>Severity</Text>
        <View style={styles.seg} accessibilityRole="radiogroup">
          {SEVERITIES.map((s, i) => {
            const on = s === draft.severity;
            return (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => updateDraft({ severity: s })}
                style={[
                  styles.segItem,
                  i < 3 && styles.segDivider,
                  on &&
                    (s === "critical" ? styles.segCritical : styles.segOn),
                ]}
              >
                <Text
                  style={[
                    styles.segText,
                    on && {
                      color: s === "critical" ? colors.red : "#6D4700",
                    },
                  ]}
                >
                  {SEVERITY_LABEL[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.k}>Location</Text>
          <Text style={styles.v}>{loc?.address ?? "Address not available"}</Text>
          {loc?.locality ? (
            <T variant="small" style={{ fontSize: 12 }}>
              {loc.locality}
            </T>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Text style={styles.link}>Edit</Text>
        </Pressable>
      </View>

      <Card tint style={styles.dest}>
        <View style={styles.destIcon}>
          <Icon name="business-outline" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.destTitle}>{city} Municipal Corporation</Text>
          <Text style={styles.destSub}>{category.department}</Text>
        </View>
      </Card>

      {otherCity ? (
        <View style={{ marginTop: space.sm }}>
          <Notice icon="navigate-outline">
            {`You're in ${gpsCity}, so this goes to ${gpsCity}'s municipal office.`}
          </Notice>
        </View>
      ) : null}
      {outsideLimits ? (
        <View style={{ marginTop: space.sm }}>
          <Notice tone="warn" icon="map-outline">
            {`This location isn't inside a city we support yet. It'll be sent to ${city} for review.`}
          </Notice>
        </View>
      ) : null}

      <View style={styles.sla}>
        <Icon name="time-outline" size={15} color={colors.ink2} />
        <Text style={styles.slaText}>
          Target: resolved within {SLA_LABEL[draft.severity]} (
          {SEVERITY_LABEL[draft.severity]})
        </Text>
      </View>

      {draft.severity === "critical" ? (
        <View style={{ marginTop: space.sm }}>
          <Notice tone="danger" icon="shield-outline">
            {"CivicLens isn't an emergency service. If anyone is in danger, call 112."}
          </Notice>
        </View>
      ) : null}
      {error ? (
        <View style={{ marginTop: space.sm }}>
          <Notice tone="danger" icon="alert-circle-outline">
            {error}
          </Notice>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  k: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.ink3,
    marginBottom: 3,
  },
  v: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  titleInput: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
    minHeight: 24,
  },
  link: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.green7 },
  seg: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    overflow: "hidden",
    marginTop: 2,
  },
  segItem: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  segDivider: { borderRightWidth: 1, borderRightColor: colors.line },
  segOn: {
    backgroundColor: "#FCE9C7",
    borderBottomWidth: 2,
    borderBottomColor: colors.amber,
  },
  segCritical: {
    backgroundColor: colors.redBg,
    borderBottomWidth: 2,
    borderBottomColor: colors.red,
  },
  segText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink2 },
  dest: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.md,
  },
  destIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.green7,
    alignItems: "center",
    justifyContent: "center",
  },
  destTitle: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  destSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.green8,
    marginTop: 1,
  },
  sla: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: space.md,
  },
  slaText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink2 },
});
