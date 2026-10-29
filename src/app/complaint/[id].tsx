import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Photo, Timeline } from "@/components/complaint-bits";
import { Screen } from "@/components/screen";
import {
    Button,
    Chip,
    Icon,
    Notice,
    StatusChip,
    T,
    TopBar,
} from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import { getCategory } from "@/data/categories";
import {
    dueAt,
    formatDateTime,
    formatDuration,
    isOpen,
    isOverdue,
    SEVERITY_LABEL,
    SLA_LABEL,
} from "@/lib/format";
import { useApp } from "@/store/app-store";

export default function ComplaintDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getComplaint, myComplaintIds } = useApp();
  const insets = useSafeAreaInsets();
  const c = id ? getComplaint(id) : undefined;

  // Citizens only see their own complaints (RLS later; enforced here for the UI).
  if (!c || !myComplaintIds.includes(c.id)) {
    return (
      <Screen footer={<Button label="Back" onPress={() => router.back()} />}>
        <TopBar />
        <T variant="heading">{"This complaint isn't available."}</T>
      </Screen>
    );
  }

  const category = getCategory(c.category);
  const due = dueAt(c.createdAt, c.severity);
  const overdue = isOverdue(c.createdAt, c.severity, c.status);
  const resolved = c.status === "resolved" || c.status === "closed";
  const withinSla =
    resolved && c.resolvedAt ? new Date(c.resolvedAt) <= due : false;

  return (
    <Screen
      edges={resolved ? ["bottom"] : ["top", "bottom"]}
      contentStyle={resolved ? { paddingTop: 0 } : undefined}
      footer={
        resolved ? null : (
          <Button
            kind="outline"
            label="Back to my complaints"
            onPress={() => router.replace("/track")}
          />
        )
      }
    >
      {resolved ? (
        <View style={[styles.banner, { paddingTop: insets.top + space.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/track")
            }
            style={styles.bannerBack}
          >
            <Icon name="chevron-back" size={18} color="#fff" />
          </Pressable>
          <View style={styles.bannerOk}>
            <Icon name="checkmark" size={30} color={colors.green7} />
          </View>
          <Text style={styles.bannerTitle}>Issue resolved</Text>
          <Text style={styles.bannerSub}>
            Thanks for helping make {c.city} better.
          </Text>
        </View>
      ) : (
        <TopBar
          title={c.reference}
          right={
            isOpen(c.status) ? (
              <View style={styles.live}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : null
          }
        />
      )}

      <Photo
        uri={c.photoUri}
        category={c.category}
        style={{ height: 150, marginTop: resolved ? space.lg : 0 }}
      />

      {resolved ? (
        <T variant="mono" style={{ marginTop: space.md }}>
          {c.reference}
        </T>
      ) : null}
      <T variant="title" style={{ marginTop: resolved ? 2 : space.md }}>
        {c.title}
      </T>
      <View style={styles.chips}>
        <StatusChip status={c.status} />
        <Chip
          label={`${c.department} · ${c.city}`}
          fg={colors.ink2}
          bg={colors.paper}
        />
        {overdue ? (
          <Chip label="Overdue" fg={colors.red} bg={colors.redBg} dot />
        ) : null}
      </View>

      {c.status === "rejected" && c.rejectionReason ? (
        <View style={{ marginTop: space.md }}>
          <Notice tone="danger" icon="close-circle-outline">
            Rejected: {c.rejectionReason}
          </Notice>
        </View>
      ) : null}

      {resolved && c.resolutionNote ? (
        <View style={{ marginTop: space.md }}>
          <Text style={styles.sectionLabel}>Resolution note</Text>
          <View style={styles.note}>
            <Text style={styles.noteText}>{c.resolutionNote}</Text>
            <Text style={styles.noteCite}>
              {c.department}
              {c.resolvedAt ? ` · ${formatDateTime(c.resolvedAt)}` : ""}
            </Text>
          </View>
          {c.resolvedAt ? (
            <View style={styles.within}>
              <Icon
                name="time-outline"
                size={15}
                color={withinSla ? colors.green8 : colors.red}
              />
              <Text
                style={[styles.withinText, !withinSla && { color: colors.red }]}
              >
                Resolved in {formatDuration(c.createdAt, c.resolvedAt)} ·{" "}
                {withinSla ? "within" : "past"} the {SLA_LABEL[c.severity]}{" "}
                target
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.meta}>
        <Meta k="Submitted" v={formatDateTime(c.createdAt)} />
        {resolved && c.resolvedAt ? (
          <Meta k="Resolved" v={formatDateTime(c.resolvedAt)} />
        ) : (
          <Meta
            k="Target by"
            v={`${formatDateTime(due)}${overdue ? " · late" : isOpen(c.status) ? " · on track" : ""}`}
            danger={overdue}
          />
        )}
      </View>

      <View style={styles.infoRow}>
        <Icon name="location-outline" size={16} color={colors.green7} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoValue}>{c.address}</Text>
          {c.locality ? (
            <T variant="small" style={{ fontSize: 12 }}>
              {c.locality}
            </T>
          ) : null}
        </View>
      </View>
      <View style={styles.infoRow}>
        <Icon name="pricetag-outline" size={16} color={colors.green7} />
        <Text style={[styles.infoValue, { flex: 1 }]}>
          {category.label} · {SEVERITY_LABEL[c.severity]}
        </Text>
      </View>
      {c.description ? (
        <View style={styles.infoRow}>
          <Icon name="chatbox-outline" size={16} color={colors.green7} />
          <T variant="body" style={{ flex: 1, color: colors.ink2 }}>
            {c.description}
          </T>
        </View>
      ) : null}

      <Text
        style={[
          styles.sectionLabel,
          { marginTop: space.lg, marginBottom: space.md },
        ]}
      >
        Status history
      </Text>
      <Timeline history={c.history} pendingResolved={isOpen(c.status)} />

      {c.isDemo ? (
        <T variant="mono" style={{ fontSize: 10, marginTop: space.md }}>
          DEMO DATA
        </T>
      ) : null}
    </Screen>
  );
}

function Meta({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <View style={styles.metaCell}>
      <T variant="caption" style={{ fontSize: 9.5 }}>
        {k}
      </T>
      <Text style={[styles.metaValue, danger && { color: colors.red }]}>
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.green9,
    marginHorizontal: -(space.lg + 2),
    paddingHorizontal: space.lg + 2,
    paddingBottom: space.xl,
    alignItems: "center",
  },
  bannerBack: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerOk: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.sm,
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: "#fff",
    marginTop: space.md,
  },
  bannerSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.greenOnDark,
    marginTop: 4,
  },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green5,
  },
  liveText: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    color: colors.green7,
    letterSpacing: 0.8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: space.sm,
  },
  meta: { flexDirection: "row", gap: space.sm, marginTop: space.md },
  metaCell: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  metaValue: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "flex-start",
    marginTop: space.md,
  },
  infoValue: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  note: {
    marginTop: space.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.green5,
    backgroundColor: colors.green1,
    padding: space.md,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  noteCite: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.green8,
    marginTop: 6,
  },
  within: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: space.sm,
  },
  withinText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.green8,
  },
});
