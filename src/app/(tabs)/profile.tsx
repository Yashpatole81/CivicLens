import { router } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { Button, Card, Icon, T } from "@/components/ui";
import { colors, fonts, space } from "@/constants/theme";
import { STATES } from "@/data/locations";
import { useApp } from "@/store/app-store";

export default function Profile() {
  const { user, signOut } = useApp();
  if (!user) return null;
  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const stateName =
    STATES.find((s) => s.id === user.state || s.name === user.state)?.name ??
    user.state;

  return (
    <Screen edges={["top"]}>
      <T variant="display" style={{ marginTop: space.sm }}>
        Profile
      </T>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="heading">{user.fullName}</T>
          <T variant="small">{user.email}</T>
        </View>
      </Card>

      <Card style={{ marginTop: space.md, gap: space.md }}>
        <Row
          icon="location-outline"
          label="Home city"
          value={`${user.city}, ${stateName ?? ""}`}
        />
        {user.ward ? (
          <Row icon="business-outline" label="Municipal Ward" value={user.ward} />
        ) : null}
        <Row
          icon="shield-checkmark-outline"
          label="Account"
          value="Citizen · email verified"
        />
      </Card>

      {Platform.OS === "web" ? (
        <Button
          kind="outline"
          label="Open municipal dashboard"
          icon="grid-outline"
          style={{ marginTop: space.lg }}
          onPress={() => router.push("/admin")}
        />
      ) : null}

      <Button
        kind="danger"
        label="Log out"
        icon="log-out-outline"
        style={{ marginTop: space.md }}
        onPress={() => {
          signOut();
          router.replace("/welcome");
        }}
      />
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={colors.ink3} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green7,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontFamily: fonts.bold, fontSize: 16, color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  label: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.ink3 },
  value: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
});
