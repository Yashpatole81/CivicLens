import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { Button, Card, Icon, T } from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import { dueAt, formatDateTime } from "@/lib/format";
import { useApp } from "@/store/app-store";

export default function Submitted() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getComplaint } = useApp();
  const c = id ? getComplaint(id) : undefined;

  if (!c) {
    return (
      <Screen
        footer={
          <Button
            label="Back to home"
            onPress={() => router.replace("/home")}
          />
        }
      >
        <T variant="heading">Complaint not found.</T>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button
            label="Track complaint"
            onPress={() => router.replace(`/complaint/${c.id}`)}
          />
          <Button
            kind="ghost"
            label="Back to home"
            onPress={() => router.replace("/home")}
          />
        </>
      }
    >
      <View style={{ alignItems: "center", marginTop: space.xl }}>
        <View style={styles.ok}>
          <Icon name="checkmark" size={32} color="#fff" />
        </View>
        <T variant="display" style={{ textAlign: "center" }}>
          Complaint submitted
        </T>
        <T variant="small" style={{ marginTop: 4 }}>
          Keep this reference to track it.
        </T>
      </View>

      <View
        style={styles.ticket}
        accessible
        accessibilityLabel={`Complaint reference ${c.reference}`}
      >
        <View style={styles.top}>
          <T variant="caption">Complaint reference</T>
          <Text style={styles.ref} selectable>
            {c.reference}
          </Text>
        </View>
        <View style={styles.perf}>
          <View style={[styles.notch, { left: -(space.md + 11) }]} />
          <View style={[styles.notch, { right: -(space.md + 11) }]} />
        </View>
        <View style={styles.grid}>
          <Cell k="Department" v={c.department} />
          <Cell k="City" v={c.city} />
          <Cell k="Submitted" v={formatDateTime(c.createdAt)} />
          <Cell
            k="Target by"
            v={formatDateTime(dueAt(c.createdAt, c.severity))}
          />
        </View>
        <View style={styles.stamp}>
          <Text style={styles.stampText}>RECEIVED</Text>
        </View>
      </View>

      <Card style={styles.note}>
        <Icon name="notifications-outline" size={18} color={colors.green7} />
        <T variant="small" style={{ flex: 1, color: colors.ink2 }}>
          We’ll notify you here whenever the status changes.
        </T>
      </Card>
    </Screen>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ width: "50%", paddingVertical: 6 }}>
      <T variant="caption" style={{ fontSize: 9.5 }}>
        {k}
      </T>
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 12.5,
          color: colors.ink,
          marginTop: 2,
        }}
        numberOfLines={2}
      >
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ok: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: colors.green1,
    marginBottom: space.md,
  },
  ticket: {
    marginTop: space.xl,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  top: { alignItems: "center", padding: space.lg, gap: 6 },
  ref: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    color: colors.green9,
    letterSpacing: 0.5,
  },
  perf: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.line,
    marginHorizontal: space.md,
  },
  notch: {
    position: "absolute",
    top: -11,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  stamp: {
    position: "absolute",
    right: 14,
    bottom: 14,
    transform: [{ rotate: "-8deg" }],
    borderWidth: 2,
    borderColor: colors.green5,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: "#fff",
    opacity: 0.85,
  },
  stampText: {
    fontFamily: fonts.monoBold,
    fontSize: 9,
    color: colors.green5,
    letterSpacing: 1.2,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.md,
    borderRadius: radius.md,
  },
});
