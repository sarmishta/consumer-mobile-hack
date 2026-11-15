import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { Button, EmojiPicker, Input, Raindrop, text } from "../components/ui";
import { useSession } from "../lib/session";
import { AVATARS, colors } from "../lib/theme";

const CARDS = [
  { emoji: "🎯", title: "Pick one daily goal", body: "Gym, call Mom, read 10 pages. Just one thing, every day." },
  { emoji: "🫶", title: "Check in with your people", body: "Two to six friends or family. See who's done today, live." },
  { emoji: "☔", title: "Miss a day? You owe them a raincheck, not a fine", body: "Bad days happen. Turn them into coffee, dinner, or movie night." },
];

const DROPS = [
  { top: 40, left: 36, size: 12, color: colors.rain, opacity: 0.5 },
  { top: 96, left: 300, size: 16, color: colors.amber, opacity: 0.35 },
  { top: 180, left: 72, size: 9, color: colors.rain, opacity: 0.35 },
  { top: 24, left: 220, size: 10, color: colors.rain, opacity: 0.6 },
  { top: 150, left: 250, size: 8, color: colors.amber, opacity: 0.5 },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [step, setStep] = useState<"intro" | "profile">("intro");
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (page === CARDS.length - 1) return setStep("profile");
    listRef.current?.scrollToIndex({ index: page + 1 });
    setPage(page + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {DROPS.map((drop, i) => (
          <Raindrop
            key={i}
            size={drop.size}
            color={drop.color}
            style={{ position: "absolute", top: drop.top, left: drop.left * (width / 390), opacity: drop.opacity }}
          />
        ))}
      </View>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>☂️ RAINCHECK</Text>
        <Text style={styles.tagline}>Bad days, good nights.</Text>
      </View>
      {step === "intro" ? (
        <>
          <FlatList
            ref={listRef}
            data={CARDS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.title}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            renderItem={({ item, index }) => (
              <View testID={`onboarding-card-${index}`} style={[styles.page, { width }]}>
                <View style={styles.introCard}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                  <Text style={[text.title, styles.center]}>{item.title}</Text>
                  <Text style={[text.subtitle, styles.center]}>{item.body}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.dots}>
            {CARDS.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.footer}>
            <Button testID="onboarding-next" label={page === CARDS.length - 1 ? "Let's go" : "Next"} onPress={next} big />
            <Button testID="onboarding-skip" label="Skip" variant="ghost" onPress={() => setStep("profile")} />
          </View>
        </>
      ) : (
        <ProfileStep />
      )}
    </SafeAreaView>
  );
}

function ProfileStep() {
  const createUser = useMutation(api.users.create);
  const { setUserId } = useSession();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = await createUser({ name, avatar });
      await setUserId(id);
      router.replace("/group-setup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.profile} keyboardShouldPersistTaps="handled">
        <Text style={styles.bigAvatar}>{avatar}</Text>
        <Text style={text.title}>What should your people call you?</Text>
        <Input
          testID="name-input"
          accessibilityLabel="First name"
          placeholder="First name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          maxLength={24}
        />
        <Text style={text.label}>Pick an avatar</Text>
        <EmojiPicker options={AVATARS} value={avatar} onChange={setAvatar} testIDPrefix="avatar" />
        <Button testID="profile-continue" label="Continue" onPress={submit} disabled={!name.trim()} loading={saving} big />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  brandRow: { paddingHorizontal: 24, paddingTop: 12, gap: 4 },
  brand: { color: colors.amber, fontSize: 16, fontWeight: "900", letterSpacing: 3 },
  tagline: { color: colors.muted, fontSize: 15, fontStyle: "italic" },
  page: { paddingHorizontal: 24, justifyContent: "center" },
  introCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 48,
    alignItems: "center",
    gap: 18,
  },
  cardEmoji: { fontSize: 96 },
  center: { textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.faint },
  dotActive: { width: 24, backgroundColor: colors.amber },
  footer: { paddingHorizontal: 24, paddingBottom: 12, gap: 4 },
  profile: { padding: 24, gap: 20, paddingBottom: 48 },
  bigAvatar: { fontSize: 80, textAlign: "center", marginTop: 12 },
});
