import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { colors } from "../../lib/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accentInk }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "sunny" : "sunny-outline"} size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="crew"
        options={{
          title: "Crew",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
