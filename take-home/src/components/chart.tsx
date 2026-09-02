import { DashPathEffect, LinearGradient, vec } from "@shopify/react-native-skia";
import { CartesianChart, Bar, Line, type Scale } from "victory-native";

import { useTheme } from "@/hooks/use-theme";

export interface ChartData extends Record<string, unknown> {
  month: number;
  value: number;
}

export interface ChartProps {
  data: ChartData[];
  domainY?: [number, number];
  onScaleChange?: (xScale: Scale, yScale: Scale) => void;
}

function linearRegression(data: ChartData[]): (month: number) => number {
  const n = data.length;
  if (n === 0) return () => 0;
  const sumX = data.reduce((s, d) => s + d.month, 0);
  const sumY = data.reduce((s, d) => s + d.value, 0);
  const sumXY = data.reduce((s, d) => s + d.month * d.value, 0);
  const sumXX = data.reduce((s, d) => s + d.month * d.month, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return () => sumY / n;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return (month) => intercept + slope * month;
}

export default function Chart({ data, domainY, onScaleChange }: ChartProps) {
  const theme = useTheme();
  const trend = linearRegression(data);
  const dataWithTrend = data.map((d) => ({ ...d, trend: trend(d.month) }));

  return (
    <CartesianChart
      data={dataWithTrend}
      xKey="month"
      yKeys={["value", "trend"]}
      domain={domainY ? { y: domainY } : undefined}
      domainPadding={{
        left: 50,
        right: 50,
        top: 30,
      }}
      onScaleChange={(x, y) => onScaleChange?.(x, y)}
      axisOptions={{
        labelColor: theme.textSecondary,
        lineColor: theme.textSecondary,
        formatXLabel(value) {
          const date = new Date(2023, Number(value) - 1);

          return date.toLocaleString("default", {
            month: "short",
          });
        },
      }}
    >
      {({ points, chartBounds }) => (
        <>
          <Bar
            chartBounds={chartBounds}
            points={points.value}
            roundedCorners={{
              topLeft: 5,
              topRight: 5,
            }}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, 400)}
              colors={["#a78bfa", "#a78bfa50"]}
            />
          </Bar>
          <Line points={points.trend} color="#f59e0b" strokeWidth={2}>
            <DashPathEffect intervals={[6, 6]} />
          </Line>
        </>
      )}
    </CartesianChart>
  );
}
