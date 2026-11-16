import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useSyncExternalStore } from "react";
import { Modal, Text as RNText, ScrollView, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { KINDS } from "../onboarding/options";
import { Avatar, Button, Icon, Row, Section, Text } from "../ui";
import { useCurrentMember, useSession } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

let open = false;
const listeners = new Set<() => void>();
function setOpen(value: boolean) {
  open = value;
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The tappable crew name, nested inside a LargeTitle so it inherits its type. Pair it with <CrewSwitcherSheet /> on the same screen. */
export function CrewName({ name }: { name: string }) {
  return (
    <RNText
      testID="crew-switcher"
      accessibilityRole="button"
      accessibilityLabel={`${name}, switch crew`}
      onPress={() => setOpen(true)}
    >
      {name}
      <RNText style={{ color: colors.secondaryLabel, fontSize: 22 }}>{" ▾"}</RNText>
    </RNText>
  );
}

export function CrewSwitcherSheet() {
  const visible = useSyncExternalStore(subscribe, () => open);
  const { userId, setActiveGroupId } = useSession();
  const { group } = useCurrentMember();
  const crews = useQuery(api.crews.mine, visible && userId ? { userId } : "skip");

  const go = (path: "/crews/new" | "/crews/join") => {
    setOpen(false);
    router.push(path);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg }}>
          <Text variant="title2" style={{ flex: 1 }}>
            Your crews
          </Text>
          <Button testID="crew-switcher-close" label="Done" variant="plain" small onPress={() => setOpen(false)} />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.huge }}>
          <Section style={{ marginHorizontal: spacing.lg }}>
            {(crews ?? []).map(({ group: g, people }) => (
              <Row
                key={g._id}
                testID={`crew-switch-${g._id}`}
                title={g.name}
                subtitle={`${KINDS.find((k) => k.kind === g.kind)?.label ?? "Crew"} · ${people.length} ${people.length === 1 ? "person" : "people"}`}
                left={
                  <View style={{ flexDirection: "row", width: 64 }}>
                    {people.slice(0, 3).map((p, i) => (
                      <View key={p.memberId} style={{ marginLeft: i === 0 ? 0 : -18 }}>
                        <Avatar name={p.name} emoji={p.avatar} size={34} />
                      </View>
                    ))}
                  </View>
                }
                right={g._id === group?._id ? <Icon name="checkmark.circle.fill" size={22} color={colors.accentInk} /> : undefined}
                onPress={async () => {
                  await setActiveGroupId(g._id);
                  setOpen(false);
                }}
              />
            ))}
          </Section>
          <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Button testID="new-crew" label="New crew" icon="plus" onPress={() => go("/crews/new")} />
            <Button testID="join-crew" label="Join with code" icon="person.badge.plus" variant="secondary" onPress={() => go("/crews/join")} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
