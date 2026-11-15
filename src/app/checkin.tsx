import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { PopIn, Sticker } from "../components/fun";
import { Button, Icon, Input, Placeholder, Screen, Text } from "../components/ui";
import { useCurrentMember } from "../lib/session";
import { colors, radius, spacing } from "../lib/theme";

type Photo = { uri: string; mimeType: string };

const pickerOptions: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6 };

export default function CheckIn() {
  const { member } = useCurrentMember();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const checkIn = useMutation(api.checkins.checkIn);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function pick(fromCamera: boolean) {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          fromCamera ? "Camera is off" : "Photos are off",
          "Turn it on in Settings. A photo is your proof.",
        );
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      setPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" });
    } catch {
      Alert.alert(
        fromCamera ? "No camera here" : "Couldn't open photos",
        fromCamera ? "Choose a photo from your library instead." : "Try again, or snap one with the camera.",
      );
    }
  }

  async function submit() {
    if (!member || !photo) return;
    setBusy(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const blob = await (await fetch(photo.uri)).blob();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": photo.mimeType },
        body: blob,
      });
      if (!response.ok) throw new Error(`Upload failed (${response.status})`);
      const photoStorageId = ((await response.json()) as { storageId: Id<"_storage"> }).storageId;
      await checkIn({
        memberId: member._id,
        source: "app",
        photoStorageId,
        note: note.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
      setTimeout(() => router.back(), 1600);
    } catch (error) {
      setBusy(false);
      Alert.alert("Check-in didn't go through", error instanceof Error ? error.message : "Try again.");
    }
  }

  if (done) {
    return (
      <Screen edges={["left", "right", "bottom"]} background={colors.accentSoft}>
        <View testID="checkin-success" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <PopIn>
            <Icon name="checkmark.circle.fill" size={120} color={colors.mint} weight="bold" />
          </PopIn>
          <Text variant="display" align="center">
            Checked in!
          </Text>
          <Sticker label="+1 day" color={colors.accent} tilt={-6} delay={250} size="lg" style={{ alignSelf: "center" }} />
          <Text variant="callout" weight="600" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
            Your crew can see it now.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={["left", "right"]}
      style={{ paddingTop: spacing.xxl }}
      footer={
        <Button
          testID="checkin-submit"
          label={photo ? "Check in" : "Add a photo to check in"}
          icon={photo ? "checkmark" : "camera.fill"}
          haptic
          loading={busy}
          disabled={!member || !photo}
          onPress={submit}
        />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xl }}>
        <Text variant="largeTitle" style={{ flex: 1 }}>
          Check in
        </Text>
        <Button testID="checkin-close" label="Cancel" variant="plain" small onPress={() => router.back()} />
      </View>

      {photo ? (
        <View>
          <Image
            testID="checkin-photo-preview"
            source={{ uri: photo.uri }}
            style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.fill }}
          />
          <Pressable
            testID="checkin-remove-photo"
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            onPress={() => setPhoto(null)}
            hitSlop={8}
            style={{
              position: "absolute",
              top: spacing.sm,
              right: spacing.sm,
              backgroundColor: "rgba(0,0,0,0.45)",
              borderRadius: radius.pill,
              padding: spacing.xs,
            }}
          >
            <Icon name="xmark" size={14} color={colors.white} weight="bold" />
          </Pressable>
        </View>
      ) : (
        <Placeholder height={220} icon="camera.fill" label="Snap proof. A photo is required." tint="amber" />
      )}

      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
        <Button
          testID="checkin-take-photo"
          label="Take photo"
          icon="camera.fill"
          variant="secondary"
          small
          style={{ flex: 1 }}
          onPress={() => pick(true)}
        />
        <Button
          testID="checkin-choose-photo"
          label="Choose"
          icon="photo.on.rectangle"
          variant="secondary"
          small
          style={{ flex: 1 }}
          onPress={() => pick(false)}
        />
      </View>

      <Text variant="footnote" color={colors.label} weight="800" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
        NOTE
      </Text>
      <Input
        testID="checkin-note-input"
        value={note}
        onChangeText={setNote}
        placeholder="How'd it go? (optional)"
        maxLength={280}
        multiline
        style={{ minHeight: 88, textAlignVertical: "top" }}
      />
    </Screen>
  );
}
