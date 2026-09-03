import { StyleSheet, View } from "react-native";

import { useTourTarget } from "@/lib/tour";
import { ThemedText } from "@/components/themed-text";
import type { ChartData } from "@/components/chart-types";

export interface DashboardChartProps {
  data: ChartData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  const chartRef = useTourTarget("chart");
  const keyRef = useTourTarget("key");

  return (
    <>
      <ThemedText type="smallBold" style={styles.webTitle}>
        Energy Sold (kWh)
      </ThemedText>
      <View ref={chartRef as any} collapsable={false} style={styles.webList}>
        {data.map((item) => (
          <View key={item.month} style={styles.webRow}>
            <ThemedText themeColor="textSecondary" style={styles.month}>
              {new Date(2023, item.month - 1).toLocaleString("default", {
                month: "short",
              })}
              : {item.value}
            </ThemedText>
            <View style={[styles.webBar, { width: `${Math.min(item.value, 100)}%` }]} />
          </View>
        ))}
      </View>
      <View ref={keyRef as any} collapsable={false} style={{ marginTop: 16 }}>
        <ThemedText>Create instantly demo</ThemedText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  webList: {
    width: "100%",
    padding: 16,
    gap: 8,
  },
  webTitle: {
    marginBottom: 4,
  },
  webRow: {
    gap: 4,
  },
  webBar: {
    height: 12,
    backgroundColor: "#a78bfa",
    borderRadius: 6,
  },
  month: {
    fontSize: 12,
  },
});
