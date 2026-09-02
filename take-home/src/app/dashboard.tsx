import { useEffect, useState } from "react";
import { useTourTarget } from "@/lib/tour";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import type { ChartData, ChartProps } from "@/components/chart";
import type { ChartBounds } from "victory-native";
import type { TData } from "@/schemas/data.schema";
import { HelpButton } from "@/components/help-button";
import { ThemedText } from "@/components/themed-text";

const CHART_PAD_X = 50;
const BAR_LABEL_WIDTH = 48;

let Chart: React.ComponentType<ChartProps> | null = null;
if (Platform.OS !== "web") {
  Chart = require("@/components/chart").default;
}

function DashboardContent({ chartData }: { chartData: ChartData[] }) {
  const chartRef = useTourTarget("chart");
  const keyRef = useTourTarget("key");
  const [chartBounds, setChartBounds] = useState<ChartBounds | null>(null);

  const barX = (index: number): number => {
    if (!chartBounds) return 0;
    const { left, right } = chartBounds;
    if (chartData.length === 1) return (left + right) / 2;
    const span = right - left - 2 * CHART_PAD_X;
    return left + CHART_PAD_X + (index * span) / (chartData.length - 1);
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View ref={chartRef as any} collapsable={false} style={styles.webList}>
          {chartData.map((item) => (
            <View key={item.month} style={styles.webRow}>
              <ThemedText themeColor="textSecondary" style={styles.month}>
                {new Date(2023, item.month - 1).toLocaleString("default", {
                  month: "short",
                })}
                : {item.value}
              </ThemedText>
              <View
                style={[
                  styles.webBar,
                  { width: `${Math.min(item.value, 100)}%` },
                ]}
              />
            </View>
          ))}
        </View>
        <View ref={keyRef as any} collapsable={false} style={{ marginTop: 16 }}>
          <ThemedText>Create instantly demo</ThemedText>
        </View>
        <HelpButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chart} ref={chartRef as any} collapsable={false}>
        {Chart ? (
          <>
            <View style={styles.canvas}>
              <Chart
                data={chartData}
                paddingX={CHART_PAD_X}
                onChartBoundsChange={setChartBounds}
              />
            </View>
            <View style={styles.labelRow} collapsable={false}>
              {chartBounds &&
                chartData.map((item, i) => (
                  <ThemedText
                    key={`v-${item.month}`}
                    style={[
                      styles.value,
                      styles.barLabel,
                      { left: barX(i) - BAR_LABEL_WIDTH / 2 },
                    ]}
                  >
                    {item.value}
                  </ThemedText>
                ))}
            </View>
            <View style={styles.labelRow} ref={keyRef as any}>
              {chartBounds &&
                chartData.map((item, i) => (
                  <ThemedText
                    key={item.month}
                    themeColor="textSecondary"
                    style={[
                      styles.month,
                      styles.barLabel,
                      { left: barX(i) - BAR_LABEL_WIDTH / 2 },
                    ]}
                  >
                    {new Date(2023, item.month - 1).toLocaleString("default", {
                      month: "short",
                    })}
                  </ThemedText>
                ))}
            </View>
          </>
        ) : null}
      </View>
      <HelpButton />
    </View>
  );
}

export default function Index() {
  const [raw, setRaw] = useState<TData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/datas");
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to fetch: ${res.status}`);
        }
        const json = (await res.json()) as TData[];
        if (!cancelled) setRaw(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fallback: ChartData[] = [
    { month: 1, value: 1 },
    { month: 2, value: 2 },
    { month: 3, value: 3 },
    { month: 4, value: 4 },
    { month: 5, value: 5 },
  ];

  const chartData: ChartData[] =
    raw && raw.length > 0
      ? [...raw]
          .sort((a, b) => a.id - b.id)
          .map((d) => ({ month: d.id, value: d.value }))
      : fallback;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Loading datas...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText style={styles.error}>Error: {error}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Showing fallback data
        </ThemedText>
        <View style={styles.chart}>
          {Platform.OS !== "web" && Chart ? (
            <Chart data={fallback} />
          ) : (
            <View>
              <ThemedText>This currently only works for mobile</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (!chartData.length) {
    return (
      <View style={styles.center}>
        <ThemedText>No data</ThemedText>
      </View>
    );
  }

  return <DashboardContent chartData={chartData} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: "#b42318",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  chart: {
    width: "100%",
    height: 300,
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 10,
  },

  canvas: {
    flex: 1,
  },

  labelRow: {
    height: 18,
    width: "100%",
  },

  barLabel: {
    position: "absolute",
    width: BAR_LABEL_WIDTH,
    textAlign: "center",
  },

  month: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
  },
  webList: {
    width: "100%",
    padding: 16,
    gap: 8,
  },
  webRow: {
    gap: 4,
  },
  webBar: {
    height: 12,
    backgroundColor: "#a78bfa",
    borderRadius: 6,
  },
});
