import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { ChartData, ChartProps } from "@/components/chart-types";

export type { ChartData, ChartProps };

export default function Chart({ data }: ChartProps) {
  // Web fallback: simple bar list (no Skia / Victory)
  // Mirrors the web dashboard chart but stays generic.
  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View key={item.month} style={styles.row}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            {new Date(2023, item.month - 1).toLocaleString("default", {
              month: "short",
            })}
            : {item.value}
          </ThemedText>
          <View style={[styles.bar, { width: `${Math.min(item.value, 100)}%` }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
    paddingVertical: 8,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  bar: {
    height: 12,
    backgroundColor: "#a78bfa",
    borderRadius: 6,
  },
});
