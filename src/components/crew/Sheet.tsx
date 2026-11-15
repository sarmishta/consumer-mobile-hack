import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }} onPress={onClose} />
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          padding: spacing.xxl,
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
      >
        {children}
      </View>
    </Modal>
  );
}
