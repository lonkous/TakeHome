import { LinearGradient, vec } from "@shopify/react-native-skia";
import { CartesianChart, Bar, type Scale } from "victory-native";

import { useTheme } from "@/hooks/use-theme";

export interface ChartData extends Record<string, unknown> {
  month: number;
  value: number;
}

export interface ChartProps {
  data: ChartData[];
  onScaleChange?: (xScale: Scale) => void;
}

export default function Chart({ data, onScaleChange }: ChartProps) {
  const theme = useTheme();

  return (
    <CartesianChart
      data={data}
      xKey="month"
      yKeys={["value"]}
      domainPadding={{
        left: 50,
        right: 50,
        top: 30,
      }}
      onScaleChange={(x) => onScaleChange?.(x)}
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
      )}
    </CartesianChart>
  );
}
