import { Redirect, Tabs } from "expo-router";
import type { ColorValue } from "react-native";

import { Icon, type IconName } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import { useApp } from "@/store/app-store";

type TabIconProps = { color: ColorValue; focused: boolean };

function TabIcon({
  color,
  focused,
  name,
  active,
}: TabIconProps & { name: IconName; active: IconName }) {
  return (
    <Icon name={focused ? active : name} size={22} color={color as string} />
  );
}

export default function TabsLayout() {
  const { user } = useApp();
  if (!user) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green7,
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: "#fff" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: (p: TabIconProps) => (
            <TabIcon {...p} name="home-outline" active="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: "Track",
          tabBarIcon: (p: TabIconProps) => (
            <TabIcon
              {...p}
              name="document-text-outline"
              active="document-text"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: (p: TabIconProps) => (
            <TabIcon
              {...p}
              name="notifications-outline"
              active="notifications"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (p: TabIconProps) => (
            <TabIcon {...p} name="person-outline" active="person" />
          ),
        }}
      />
    </Tabs>
  );
}
