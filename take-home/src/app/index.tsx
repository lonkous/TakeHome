import { View, StyleSheet, ActivityIndicator } from "react-native";
import MicrosoftLoginButton from "@/auth/MicrosoftLoginButton";
import { useAuth } from "@/auth/AuthContext";

export default function Index() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MicrosoftLoginButton />
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
