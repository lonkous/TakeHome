import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Scale } from "victory-native";

import { useTourTarget } from "@/lib/tour";
import { ThemedText } from "@/components/themed-text";
import Chart from "@/components/chart";
import type { ChartData } from "@/components/chart-types";
import { useTheme } from "@/hooks/use-theme";

const BAR_LABEL_WIDTH = 48;
const Y_AXIS_WIDTH = 32;
const Y_TICK_STEP = 10;
const Y_AXIS_MIN_TOP_TICK = 70;

export interface DashboardChartProps {
  data: ChartData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  const chartRef = useTourTarget("chart");
  const keyRef = useTourTarget("key");
  const [scales, setScales] = useState<{ x: Scale; y: Scale } | null>(null);
  const theme = useTheme();

  const handleScaleChange = useCallback(
    (x: Scale, y: Scale) => setScales({ x, y }),
    []
  );

  const barX = (month: number): number => (scales ? scales.x(month) : 0);

  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
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

  return (
    <View style={styles.chart} ref={chartRef as any} collapsable={false}>
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
          <Chart data={data} domainY={[0, topTick]} onScaleChange={handleScaleChange} />
        </View>
      </View>
      <View style={styles.labelRow} collapsable={false}>
        {scales &&
          data.map((item) => (
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
          data.map((item) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
