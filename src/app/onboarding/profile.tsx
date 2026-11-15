import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { Avatar, Button, EmojiPicker, Input, Screen, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { AVATARS, colors, spacing } from "../../lib/theme";

export default function ProfileStep() {
  const current = useCurrentMember();
  const update = useMutation(api.profile.update);
  const nameCrew = useMutation(api.crewName.nameAfterCreator);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emoji = avatar ?? current.user?.avatar ?? AVATARS[0];

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const finish = async () => {
    const userId = current.userId;
    if (!userId || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      let photoStorageId;
      if (photo) {
        const uploadUrl = await generateUploadUrl({});
        const blob = await (await fetch(photo.uri)).blob();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photo.mimeType ?? "image/jpeg" },
          body: blob,
        });
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        photoStorageId = (await response.json()).storageId;
      }
      await update({ userId, name: name.trim(), avatar: emoji, photoStorageId });
      await nameCrew({ userId, firstName: name.trim() });
      router.replace("/(tabs)");
    } catch (e) {
      console.warn("Profile save failed", e);
      setError("Couldn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      footer={<Button testID="profile-continue" label="Let's go" onPress={finish} loading={busy} disabled={!name.trim() || !current.userId} />}
    >
      <Text variant="title1" style={{ marginTop: spacing.xxl }}>
        What should your crew call you?
      </Text>
      <View style={{ alignItems: "center", marginTop: spacing.xxl, gap: spacing.sm }}>
        <Pressable testID="profile-photo" accessibilityRole="button" accessibilityLabel="Add a photo" onPress={pickPhoto}>
          <Avatar name={name || "Me"} photoUrl={photo?.uri} emoji={emoji} size={96} />
        </Pressable>
        <Button testID="profile-photo-button" small variant="plain" icon="camera" label={photo ? "Change photo" : "Add a photo"} onPress={pickPhoto} />
      </View>
      <Input
        testID="name-input"
        value={name}
        onChangeText={setName}
        placeholder="Your first name"
        autoCapitalize="words"
        textContentType="givenName"
        maxLength={24}
        returnKeyType="done"
        style={{ marginTop: spacing.lg }}
      />
      {error ? (
        <Text variant="footnote" color={colors.danger} style={{ marginTop: spacing.sm }}>
          {error}
        </Text>
      ) : null}
      {!photo ? (
        <>
          <Text variant="footnote" color={colors.secondaryLabel} style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
            NO PHOTO? PICK A FACE
          </Text>
          <EmojiPicker options={AVATARS} value={emoji} onChange={setAvatar} testIDPrefix="profile-avatar" />
        </>
      ) : null}
    </Screen>
  );
}
