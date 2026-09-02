import { useCallback, useEffect, useState } from "react";
import { useTourTarget } from "@/lib/tour";
import { ActivityIndicator, StyleSheet, View, Platform } from "react-native";
import type { ChartData, ChartProps } from "@/components/chart";
import type { Scale } from "victory-native";
import type { TData } from "@/schemas/data.schema";
import { HelpButton } from "@/components/help-button";
import { ThemedText } from "@/components/themed-text";
import { Backgrounds } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

const BAR_LABEL_WIDTH = 48;
const Y_AXIS_WIDTH = 32;
const Y_TICK_STEP = 10;
const Y_AXIS_MIN_TOP_TICK = 70;

let Chart: React.ComponentType<ChartProps> | null = null;
if (Platform.OS !== "web") {
  Chart = require("@/components/chart").default;
}

function DashboardContent({ chartData }: { chartData: ChartData[] }) {
  const chartRef = useTourTarget("chart");
  const keyRef = useTourTarget("key");
  const [scales, setScales] = useState<{ x: Scale; y: Scale } | null>(null);
  const scheme = useColorScheme();
  const screenBg = scheme === "dark" ? Backgrounds.dark : Backgrounds.light;

  const handleScaleChange = useCallback(
    (x: Scale, y: Scale) => setScales({ x, y }),
    []
  );

  const barX = (month: number): number => (scales ? scales.x(month) : 0);

  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 0;
  const topTick = Math.max(
    Y_AXIS_MIN_TOP_TICK,
    Math.ceil(maxValue / Y_TICK_STEP) * Y_TICK_STEP
  );
  const yTicks: number[] = [];
  for (let v = Y_TICK_STEP; v <= topTick; v += Y_TICK_STEP) {
    yTicks.push(v);
  }
  const minorLines: number[] = [];
  for (let v = Y_TICK_STEP; v <= topTick; v += Y_TICK_STEP * 2) {
    minorLines.push(v);
  }
  const theme = useTheme();

  if (Platform.OS === "web") {
    return (
      <View
        style={[styles.container, { experimental_backgroundImage: screenBg }]}
      >
        <ThemedText type="smallBold" style={styles.webTitle}>
          Energy Sold (kWh)
        </ThemedText>
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
    <View
      style={[styles.container, { experimental_backgroundImage: screenBg }]}
    >
      <View style={styles.chart} ref={chartRef as any} collapsable={false}>
        {Chart ? (
          <>
            <View style={styles.titleRow}>
              <ThemedText themeColor="textSecondary" style={styles.yAxisUnit}>
                kWh
              </ThemedText>
              <ThemedText type="smallBold" style={styles.chartTitle}>
                Energy Sold
              </ThemedText>
            </View>
            <View style={styles.plotRow}>
              <View style={styles.yAxis} collapsable={false}>
                {scales &&
                  yTicks.map((v) => (
                    <ThemedText
                      key={v}
                      themeColor="textSecondary"
                      style={[styles.yTick, { top: scales.y(v) - 7 }]}
                    >
                      {v}
                    </ThemedText>
                  ))}
              </View>
              <View style={styles.canvas}>
                {scales && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {minorLines.map((v) => (
                      <View
                        key={v}
                        style={[
                          styles.minorLine,
                          {
                            top: scales.y(v),
                            backgroundColor: theme.textSecondary,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
                <Chart
                  data={chartData}
                  domainY={[0, topTick]}
                  onScaleChange={handleScaleChange}
                />
              </View>
            </View>
            <View style={styles.labelRow} collapsable={false}>
              {scales &&
                chartData.map((item) => (
                  <ThemedText
                    key={`v-${item.month}`}
                    style={[
                      styles.value,
                      styles.barLabel,
                      { left: barX(item.month) - BAR_LABEL_WIDTH / 2 },
                    ]}
                  >
                    {item.value}
                  </ThemedText>
                ))}
            </View>
            <View style={styles.labelRow} ref={keyRef as any}>
              {scales &&
                chartData.map((item) => (
                  <ThemedText
                    key={item.month}
                    themeColor="textSecondary"
                    style={[
                      styles.month,
                      styles.barLabel,
                      { left: barX(item.month) - BAR_LABEL_WIDTH / 2 },
                    ]}
                  >
                    {new Date(2023, item.month - 1).toLocaleString("default", {
                      month: "short",
                    })}
                  </ThemedText>
                ))}
            </View>
            <View style={styles.xAxisTitleRow}>
              <ThemedText themeColor="textSecondary" style={styles.xAxisTitle}>
                Month
              </ThemedText>
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
          {Platform.OS !== "web" && Chart ? (
            <Chart data={fallback} domainY={[0, 20]} />
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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  yAxisUnit: {
    width: Y_AXIS_WIDTH,
    fontSize: 11,
    textAlign: "right",
    paddingRight: 6,
  },
  chartTitle: {
    flex: 1,
    textAlign: "center",
    marginRight: Y_AXIS_WIDTH,
  },

  plotRow: {
    flex: 1,
    flexDirection: "row",
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
  },
  yTick: {
    position: "absolute",
    right: 6,
    width: Y_AXIS_WIDTH - 6,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "right",
  },

  minorLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.35,
  },

  canvas: {
    flex: 1,
  },

  labelRow: {
    height: 18,
    marginLeft: Y_AXIS_WIDTH,
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

  xAxisTitleRow: {
    marginLeft: Y_AXIS_WIDTH,
    marginTop: 2,
  },
  xAxisTitle: {
    fontSize: 12,
    textAlign: "center",
  },
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
});
