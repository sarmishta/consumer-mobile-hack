import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatDay } from "../components/crew/format";
import { AnimatedEmoji, PopIn, Sticker } from "../components/fun";
import { Avatar, Button, Placeholder, Screen, Text } from "../components/ui";
import { colors, radius, spacing } from "../lib/theme";

export default function CashIn() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const raincheck = useQuery(api.crew.raincheck, id ? { raincheckId: id as Id<"rainchecks"> } : "skip");
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const cashIn = useMutation(api.rainchecks.cashIn);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const submit = async () => {
    if (!raincheck) return;
    setSaving(true);
    try {
      let photoStorageId: Id<"_storage"> | undefined;
      if (photo) {
        const uploadUrl = await generateUploadUrl({});
        const blob = await (await fetch(photo.uri)).blob();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photo.mimeType ?? "image/jpeg" },
          body: blob,
        });
        photoStorageId = (await response.json()).storageId;
      }
      await cashIn({ raincheckId: raincheck._id, photoStorageId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrating(true);
    } finally {
      setSaving(false);
    }
  };

  if (celebrating || raincheck?.cashedIn) {
    return (
      <Screen
        edges={["left", "right", "bottom"]}
        background={colors.accentSoft}
        style={{ justifyContent: "center", alignItems: "center", gap: spacing.lg }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <PopIn tilt={-10}>
            <AnimatedEmoji name="party" size={140} />
          </PopIn>
        </View>
        <Text variant="display" align="center">
          Raincheck cashed!
        </Text>
        {raincheck ? (
          <Sticker
            label={raincheck.plan + " ✓"}
            color={colors.mint}
            ink={colors.white}
            tilt={-4}
            delay={350}
            size="lg"
            style={{ alignSelf: "center" }}
          />
        ) : null}
        <Text variant="body" weight="600" align="center" color={colors.secondaryLabel}>
          {raincheck ? `${raincheck.name} made good on ${raincheck.plan}.` : ""} Bad days, good nights.
        </Text>
        <Button testID="cashin-done" label="Done" onPress={() => router.back()} style={{ alignSelf: "stretch" }} />
      </Screen>
    );
  }

  if (raincheck === undefined) return <Screen>{null}</Screen>;
  if (raincheck === null) {
    return (
      <Screen style={{ justifyContent: "center", gap: spacing.lg }}>
        <Text variant="title2" align="center">
          That raincheck blew away.
        </Text>
        <Button testID="cash-in-close" label="Close" variant="plain" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={["left", "right"]}
      style={{ paddingTop: spacing.xxl }}
      footer={
        <Button testID="cashin-submit" label="We did it" icon="party.popper.fill" haptic loading={saving} onPress={submit} />
      }
    >
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Button testID="cash-in-close" label="Close" variant="plain" small onPress={() => router.back()} />
      </View>
      <View style={{ alignItems: "center", gap: spacing.md, marginTop: spacing.lg }}>
        <Avatar name={raincheck.name} emoji={raincheck.avatar} size={72} ringColor={colors.coral} ring />
        <Sticker label={"Raincheck · " + formatDay(raincheck.day)} color={colors.coral} ink={colors.white} tilt={-3} size="sm" style={{ alignSelf: "center" }} />
        <Text variant="largeTitle" align="center" style={{ fontSize: 32, lineHeight: 38 }}>
          {raincheck.name} owes the crew {raincheck.plan}
        </Text>
        <Text variant="body" align="center" color={colors.secondaryLabel}>
          Did the hangout happen? Add a photo and close it out.
        </Text>
      </View>
      <Pressable testID="cashin-photo" accessibilityRole="button" onPress={pickPhoto} style={{ marginTop: spacing.xxl }}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={{ height: 260, borderRadius: radius.lg }} />
        ) : (
          <Placeholder height={260} icon="camera.fill" label="Add a hangout photo (optional)" tint="coral" />
        )}
      </Pressable>
    </Screen>
  );
}
