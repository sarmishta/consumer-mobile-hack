import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";

export default function ItemsScreen() {
  const items = useQuery(api.items.list);
  const addItem = useMutation(api.items.add);
  const [text, setText] = useState("");

  const canSubmit = text.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    const value = text;
    setText("");
    await addItem({ text: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Items</Text>
        <View style={styles.form}>
          <TextInput
            testID="item-input"
            accessibilityLabel="New item"
            style={styles.input}
            placeholder="Add an item"
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Pressable
            testID="add-button"
            accessibilityRole="button"
            accessibilityLabel="Add"
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={submit}
            disabled={!canSubmit}
          >
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>
        {items === undefined ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No items yet</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowText}>{item.text}</Text>
                <Text style={styles.rowTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  form: { flexDirection: "row", gap: 8, padding: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loading: { marginTop: 32 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  empty: { textAlign: "center", color: "#888", marginTop: 32 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  rowText: { fontSize: 16 },
  rowTime: { fontSize: 12, color: "#888", marginTop: 4 },
});
