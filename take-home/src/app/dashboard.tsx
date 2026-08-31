import { StyleSheet, Text, View, Platform } from "react-native";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia"
import { CartesianChart, Bar } from "victory-native";
import Chart, { ChartData } from "../components/chart"

export default function Index() {
  const DATA: ChartData[] = [
    { month: 1, value: 84 },
    { month: 2, value: 79 },
    { month: 3, value: 53 },
    { month: 4, value: 75 },
    { month: 5, value: 68 },
  ];


  return (
    <View style={styles.container}>
      <Text>TEST</Text>

      <View style={styles.chart}>
        {Platform.OS != 'web' ?
          <Chart data={DATA} />
          : <View><Text>This currently only works for mobile</Text></View>
        }
        <View style={styles.months}>
          {DATA.map((item) => (
            <Text key={item.month} style={styles.month}>
              {new Date(2023, item.month - 1).toLocaleString("default", {
                month: "short",
              })}
            </Text>
          ))}
        </View>
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
});
