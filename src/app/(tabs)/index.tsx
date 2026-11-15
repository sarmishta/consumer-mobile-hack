import { useQuery } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CrewRow } from "../../components/home/CrewRow";
import { dayNumber, prettyDay } from "../../components/home/dates";
import { FeedItem } from "../../components/home/FeedItem";
import { GoalCard } from "../../components/home/GoalCard";
import { AnimatedEmoji, Sticker } from "../../components/fun";
import { Button, LargeTitle, Screen, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

export default function Home() {
  const { status, member, group } = useCurrentMember();
  const board = useQuery(api.members.board, group ? { groupId: group._id } : "skip");
  const feed = useQuery(api.feed.today, group ? { groupId: group._id } : "skip");
  const [selected, setSelected] = useState<Id<"members"> | null>(null);

  if (status !== "ready" || !board || !feed) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.secondaryLabel} />
        </View>
      </Screen>
    );
  }

  const me = board.members.find((m) => m.memberId === member._id);
  const mine = feed.items.find((item) => item.memberId === member._id) ?? null;
  const shown = selected ? feed.items.filter((item) => item.memberId === selected) : feed.items;
  const done = board.members.filter((m) => m.doneToday).length;

  return (
    <Screen scroll>
      <LargeTitle
        eyebrow={`Day ${dayNumber(board.group.currentDay, board.group._creationTime)} · ${prettyDay(board.group.currentDay)}`}
        right={
          <Sticker
            label={`${done}/${board.members.length} in`}
            color={done === board.members.length ? colors.mint : colors.coral}
            ink={colors.white}
            tilt={6}
          />
        }
      >
        {board.group.name}
      </LargeTitle>

      <View style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        <CrewRow members={board.members} selected={selected} onSelect={setSelected} />
      </View>

      <GoalCard emoji={me?.emoji ?? null} goal={me?.goal ?? null} streak={me?.streak ?? member.streak} mine={mine} />

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.xxl, marginBottom: spacing.sm }}>
        <Text variant="largeTitle" style={{ flex: 1, fontSize: 28, lineHeight: 34 }}>
          Today
        </Text>
        {selected ? (
          <Button testID="feed-show-all" label="Show all" variant="plain" small onPress={() => setSelected(null)} />
        ) : null}
      </View>

      {feed.items.length === 0 ? (
        <View
          testID="feed-empty"
          style={{
            alignItems: "center",
            backgroundColor: colors.accentSoft,
            borderRadius: 28,
            paddingVertical: spacing.xxl,
            gap: spacing.sm,
          }}
        >
          <AnimatedEmoji name="wave" size={84} />
          <Text variant="title3" align="center">
            First check-in? Shoes on counts.
          </Text>
          <Sticker label="Bad days, good nights." color={colors.white} tilt={-3} size="sm" style={{ alignSelf: "center" }} />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {shown.map((item) => (
            <FeedItem key={item.checkinId} item={item} />
          ))}
        </View>
      )}
    </Screen>
  );
}
