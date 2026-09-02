import { useTour } from "@/lib/tour";
import { Button } from "react-native";

export function HelpButton() {
  const { start } = useTour();
  return <Button title="Show me around" onPress={() => start("main")} />;
}
