import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTour } from "@/lib/tour";

export function HelpButton() {
  const { start } = useTour();
  return (
    <Pressable
      onPress={() => start("main")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ThemedText type="smallBold" themeColor="textSecondary">
        Show me around
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.25)",
  },
  pressed: {
    opacity: 0.7,
  },
});
