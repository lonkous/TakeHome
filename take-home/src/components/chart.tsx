import { LinearGradient, vec } from "@shopify/react-native-skia";
import { CartesianChart, Bar } from "victory-native";

export interface ChartData extends Record<string, unknown> {
  month: number;
  value: number;
}

interface ChartProps {
  data: ChartData[];
}

export default function Chart({ data }: ChartProps) {
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
      axisOptions={{
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
