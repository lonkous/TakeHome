import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Platform } from "react-native";
import type { ChartData } from "@/components/chart"
import type { TData } from "@/schemas/data.schema";

// Avoid static import of Skia chart on web - CanvasKit is undefined and causes nullthrows at module evaluation
let Chart: React.ComponentType<{ data: ChartData[] }> | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Chart = require("@/components/chart").default;
}

export default function Index() {
  const [raw, setRaw] = useState<TData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/datas');
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to fetch: ${res.status}`);
        }
        const json = (await res.json()) as TData[];
        if (!cancelled) setRaw(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fallback: ChartData[] = [
    { month: 1, value: 1 },
    { month: 2, value: 2 },
    { month: 3, value: 3 },
    { month: 4, value: 4 },
    { month: 5, value: 5 },
  ];

  const chartData: ChartData[] = raw && raw.length > 0
    ? [...raw].sort((a, b) => a.id - b.id).map((d) => ({ month: d.id, value: d.value }))
    : fallback;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>Loading datas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.hint}>Showing fallback data</Text>
        <View style={styles.chart}>
          {Platform.OS !== 'web' && Chart ? (
            <Chart data={fallback} />
          ) : (
            <View><Text>This currently only works for mobile</Text></View>
          )}
        </View>
      </View>
    );
  }

  if (!chartData.length) {
    return (
      <View style={styles.center}>
        <Text>No data</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>TEST (Web fallback)</Text>
        <View style={styles.webList}>
          {chartData.map((item) => (
            <View key={item.month} style={styles.webRow}>
              <Text style={styles.month}>
                {new Date(2023, item.month - 1).toLocaleString("default", { month: "short" })}: {item.value}
              </Text>
              <View style={[styles.webBar, { width: `${Math.min(item.value, 100)}%` }]} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {Chart ? (
          <>
            <Chart data={chartData} />
            {/* Values row - shows numeric value per bar (mobile) */}
            <View style={styles.values}>
              {chartData.map((item) => (
                <Text key={`v-${item.month}`} style={styles.value}>
                  {item.value}
                </Text>
              ))}
            </View>
            <View style={styles.months}>
              {chartData.map((item) => (
                <Text key={item.month} style={styles.month}>
                  {new Date(2023, item.month - 1).toLocaleString("default", {
                    month: "short",
                  })}
                </Text>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View >
  );
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
    color: "#667085",
    marginTop: 8,
  },
  chart: {
    width: "100%",
    height: 300,
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  months: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
  },

  month: {
    fontSize: 12,
    color: "#303038",
  },
  values: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
    marginTop: 8,
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    minWidth: 24,
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
