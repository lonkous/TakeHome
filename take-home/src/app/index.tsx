import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ProfileScreenContent } from "@/components/profile-card";
import { Backgrounds } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Index() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const screenBg = scheme === "dark" ? Backgrounds.dark : Backgrounds.light;

  return (
    <ThemedView
      style={[styles.container, { experimental_backgroundImage: screenBg }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileScreenContent />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
