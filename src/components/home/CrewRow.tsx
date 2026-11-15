import { Pressable, ScrollView, View } from "react-native";
import type { Id } from "../../../convex/_generated/dataModel";
import { colors, spacing } from "../../lib/theme";
import { Avatar, Text } from "../ui";

export type CrewMember = {
  memberId: Id<"members">;
  name: string;
  avatar: string;
  doneToday: boolean;
};

export function CrewRow({
  members,
  selected,
  onSelect,
}: {
  members: CrewMember[];
  selected: Id<"members"> | null;
  onSelect: (memberId: Id<"members"> | null) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
      {members.map((m) => (
        <Pressable
          key={m.memberId}
          testID={`crew-avatar-${m.memberId}`}
          accessibilityRole="button"
          accessibilityLabel={`${m.name}, ${m.doneToday ? "checked in" : "not yet"}`}
          disabled={!m.doneToday}
          onPress={() => onSelect(selected === m.memberId ? null : m.memberId)}
          style={({ pressed }) => ({ alignItems: "center", width: 64, opacity: pressed ? 0.7 : 1 })}
        >
          <Avatar
            name={m.name}
            emoji={m.avatar}
            size={52}
            ring={m.doneToday}
            ringColor={selected === m.memberId ? colors.rain : colors.accent}
          />
          <View style={{ marginTop: spacing.xs }}>
            <Text
              variant="caption"
              numberOfLines={1}
              color={m.doneToday ? colors.label : colors.tertiaryLabel}
              weight={selected === m.memberId ? "600" : undefined}
            >
              {m.name.split(" ")[0]}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
