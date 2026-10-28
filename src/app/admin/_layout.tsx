import { Redirect, Slot, usePathname } from "expo-router";
import { Platform } from "react-native";

import { AdminShell, NoAccess } from "@/components/admin";
import { ADMIN_ONLY_PATHS, isAdmin, isStaff } from "@/lib/access";
import { useApp } from "@/store/app-store";

/**
 * Municipal dashboard: web only (PRD D-14), staff only, some pages admin only.
 * UI gating only. Supabase RLS must enforce the same rules server-side.
 */
export default function AdminLayout() {
  const { staff } = useApp();
  const pathname = usePathname();

  if (Platform.OS !== "web") return <Redirect href="/" />;
  if (pathname === "/admin/login") return <Slot />;
  if (!isStaff(staff)) return <Redirect href="/admin/login" />;

  const adminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  return (
    <AdminShell>
      {adminOnly && !isAdmin(staff) ? <NoAccess /> : <Slot />}
    </AdminShell>
  );
}
