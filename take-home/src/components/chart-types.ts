import type { Scale } from "victory-native";

export interface ChartData extends Record<string, unknown> {
  month: number;
  value: number;
}

export interface ChartProps {
  data: ChartData[];
  domainY?: [number, number];
  onScaleChange?: (xScale: Scale, yScale: Scale) => void;
}
