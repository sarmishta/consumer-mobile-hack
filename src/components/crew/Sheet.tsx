import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(23,19,31,0.45)" }} onPress={onClose} />
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          padding: spacing.xxl,
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
      >
        {children}
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
