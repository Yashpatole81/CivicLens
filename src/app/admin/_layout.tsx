import { Redirect, Slot, usePathname } from "expo-router";
import { ActivityIndicator, Platform, View } from "react-native";

import { AdminShell, NoAccess } from "@/components/admin";
import { ADMIN_ONLY_PATHS, isAdmin, isStaff } from "@/lib/access";
import { useApp } from "@/store/app-store";

/**
 * Municipal dashboard: web only (PRD D-14), staff only, some pages admin only.
 * UI gating only. Supabase RLS must enforce the same rules server-side.
 */
export default function AdminLayout() {
  const { staff, isAuthReady } = useApp();
  const pathname = usePathname();

  if (Platform.OS !== "web") return <Redirect href="/" />;
  if (pathname.startsWith("/admin/login")) return <Slot />;

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAF8F3" }}>
        <ActivityIndicator size="large" color="#1b4d3e" />
      </View>
    );
  }

  if (!isStaff(staff)) return <Redirect href="/admin/login" />;

  const adminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  return (
    <AdminShell>
      {adminOnly && !isAdmin(staff) ? <NoAccess /> : <Slot />}
    </AdminShell>
  );
}
