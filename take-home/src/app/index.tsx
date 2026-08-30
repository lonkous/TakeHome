import { Text, View, StyleSheet } from "react-native";
import MicrosoftLoginButton from "@/auth/MicrosoftLoginButton";

export default function Index() {
  return (
    <View style={styles.container}>
      {/* <MicrosoftLoginButton/> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
