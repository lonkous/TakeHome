import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { ChartData } from "@/components/chart-types";
import DashboardChart from "@/components/dashboard-chart";
import type { TData } from "@/schemas/data.schema";
import { HelpButton } from "@/components/help-button";
import { ThemedText } from "@/components/themed-text";
import { Backgrounds } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function DashboardContent({ chartData }: { chartData: ChartData[] }) {
  const scheme = useColorScheme();
  const screenBg = scheme === "dark" ? Backgrounds.dark : Backgrounds.light;

  return (
    <View
      style={[styles.container, { experimental_backgroundImage: screenBg }]}
    >
      <DashboardChart data={chartData} />
      <HelpButton />
    </View>
  );
}

export default function Index() {
  const [raw, setRaw] = useState<TData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scheme = useColorScheme();
  const screenBg = scheme === "dark" ? Backgrounds.dark : Backgrounds.light;

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
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load data");
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
      <View style={[styles.center, { experimental_backgroundImage: screenBg }]}>
        <ActivityIndicator />
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Loading datas...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { experimental_backgroundImage: screenBg }]}>
        <ThemedText style={styles.error}>Error: {error}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Showing fallback data
        </ThemedText>
        <View style={styles.chart}>
          <DashboardChart data={fallback} />
        </View>
      </View>
    );
  }

  if (!chartData.length) {
    return (
      <View style={[styles.center, { experimental_backgroundImage: screenBg }]}>
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
    height: 340,
    paddingTop: 16,
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
});
