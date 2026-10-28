import { router } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import {
    adminStyles as a,
    AdminPage,
    BarRow,
    Kpi,
    Panel,
    useScopedComplaints,
} from "@/components/admin";
import { ManagePanel } from "@/components/admin-manage";
import { GroupIcon } from "@/components/complaint-bits";
import { QueueTable } from "@/components/queue-table";
import { T } from "@/components/ui";
import { colors, fonts, space } from "@/constants/theme";
import { getCategory } from "@/data/categories";
import { isAdmin } from "@/lib/access";
import { isOpen, isOverdue } from "@/lib/format";
import { useApp } from "@/store/app-store";

export default function Dashboard() {
  const { staff } = useApp();
  const list = useScopedComplaints();
  const { width } = useWindowDimensions();
  const wide = width >= 1250;
  const [now] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nowDate = new Date(now);
  const overdue = list.filter((c) =>
    isOverdue(c.createdAt, c.severity, c.status, nowDate),
  );
  const count = (...s: string[]) =>
    list.filter((c) => s.includes(c.status)).length;

  const byDept = Object.entries(
    list
      .filter((c) => isOpen(c.status))
      .reduce<Record<string, { open: number; late: number }>>((acc, c) => {
        const d = (acc[c.department] ??= { open: 0, late: 0 });
        d.open += 1;
        if (isOverdue(c.createdAt, c.severity, c.status, nowDate)) d.late += 1;
        return acc;
      }, {}),
  ).sort((x, y) => y[1].open - x[1].open);
  const maxDept = Math.max(1, ...byDept.map(([, v]) => v.open));

  const byCategory = Object.entries(
    list.reduce<Record<string, number>>(
      (acc, c) => ((acc[c.category] = (acc[c.category] ?? 0) + 1), acc),
      {},
    ),
  )
    .sort((x, y) => y[1] - x[1])
    .slice(0, 5);

  const urgent = list
    .filter((c) => isOpen(c.status))
    .sort((x, y) => {
      const ox = isOverdue(x.createdAt, x.severity, x.status, nowDate) ? 0 : 1;
      const oy = isOverdue(y.createdAt, y.severity, y.status, nowDate) ? 0 : 1;
      return ox - oy || y.createdAt.localeCompare(x.createdAt);
    })
    .slice(0, 8);

  const selected =
    list.find((c) => c.id === (selectedId ?? urgent[0]?.id)) ?? null;

  return (
    <AdminPage
      title="City service dashboard"
      subtitle={
        isAdmin(staff)
          ? "All departments · Pune Municipal Corporation"
          : `${staff?.department} · Pune Municipal Corporation`
      }
    >
      <View style={a.row}>
        <Kpi label="Total" value={list.length} sub="in your scope" />
        <Kpi
          label="New"
          value={count("submitted", "assigned")}
          sub="awaiting review"
          bar="#8C968F"
        />
        <Kpi
          label="Under review"
          value={count("under_review")}
          bar={colors.violet}
        />
        <Kpi label="In progress" value={count("in_progress")} bar="#C98A10" />
        <Kpi
          label="Resolved"
          value={count("resolved", "closed")}
          bar={colors.green5}
        />
        <Kpi
          label="Overdue"
          value={overdue.length}
          sub="past SLA target"
          danger
        />
      </View>

      <View style={[a.row, { flexWrap: wide ? "nowrap" : "wrap" }]}>
        <Panel
          title="Open complaints by department"
          right="OPEN · OVERDUE"
          style={{ flex: 1.25, minWidth: 340 }}
        >
          {byDept.length === 0 ? (
            <T variant="small">No open complaints.</T>
          ) : null}
          {byDept.map(([dept, v]) => (
            <BarRow
              key={dept}
              label={dept}
              value={v.open}
              max={maxDept}
              right={
                <Text style={styles.num}>
                  {v.open} ·{" "}
                  <Text style={v.late ? { color: colors.red } : undefined}>
                    {v.late}
                  </Text>
                </Text>
              }
            />
          ))}
        </Panel>
        <Panel
          title="Most reported"
          right="BY CATEGORY"
          style={{ flex: 1, minWidth: 300 }}
        >
          {byCategory.map(([code, n]) => {
            const cat = getCategory(code);
            return (
              <View key={code} style={styles.catRow}>
                <GroupIcon group={cat.group} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <T variant="small" style={{ fontSize: 11 }}>
                    {cat.department}
                  </T>
                </View>
                <Text style={styles.catNum}>{n}</Text>
              </View>
            );
          })}
        </Panel>
      </View>

      <View style={[a.row, { flexWrap: wide ? "nowrap" : "wrap" }]}>
        <Panel
          title="Needs attention"
          right="OVERDUE FIRST"
          style={{ flex: 1, minWidth: 560 }}
        >
          <QueueTable
            rows={urgent}
            now={now}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/admin/complaints")}
            style={{ marginTop: space.md }}
          >
            <Text style={styles.link}>See all complaints →</Text>
          </Pressable>
        </Panel>
        {selected ? (
          <View style={{ width: wide ? 400 : "100%" }}>
            <ManagePanel key={selected.id} c={selected} showOpenLink />
          </View>
        ) : null}
      </View>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  num: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink2 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 5,
  },
  catLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink },
  catNum: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.ink },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.green7 },
});
