import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

type TooltipRenderProps = {
  step: { id: string; title?: string; body?: React.ReactNode };
  next: () => void;
  back: () => void;
  skip: () => void;
  isFirst: boolean;
  isLast: boolean;
  stepIndex: number;
  totalSteps: number;
};

export function TourTooltip(props: TooltipRenderProps) {
  const { step, next, back, skip, isFirst, isLast, stepIndex, totalSteps } =
    props;

  const wrappedNext = React.useCallback(() => {
    if (step.id === "key") {
      router.push("/");
      setTimeout(() => next(), 450);
    } else {
      next();
    }
  }, [step.id, next]);

  const wrappedBack = React.useCallback(() => {
    if (step.id === "profile") {
      router.push("/dashboard");
      setTimeout(() => back(), 450);
    } else {
      back();
    }
  }, [step.id, back]);

  return (
    <View style={styles.card}>
      {step.title ? <Text style={styles.title}>{step.title}</Text> : null}
      {typeof step.body === "string" ? (
        <Text style={styles.body}>{step.body}</Text>
      ) : (
        (step.body ?? null)
      )}
      <View style={styles.row}>
        <Pressable hitSlop={8} onPress={skip}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Text style={styles.count}>
          {stepIndex + 1} / {totalSteps}
        </Text>
        {!isFirst ? (
          <Pressable hitSlop={8} onPress={wrappedBack} style={styles.ghost}>
            <Text style={styles.ghostText}>Back</Text>
          </Pressable>
        ) : null}
        <Pressable hitSlop={8} onPress={wrappedNext} style={styles.primary}>
          <Text style={styles.primaryText}>{isLast ? "Done" : "Next"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A1E",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    minWidth: 260,
    maxWidth: 320,
  },
  tint: {
    backgroundColor: "rgba(26,26,30,0.55)",
    borderRadius: 16,
  },
  title: { fontSize: 17, fontWeight: "800", marginBottom: 6, color: "#fff" },
  body: { fontSize: 15, lineHeight: 21, color: "#EAEAEA" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  spacer: { flex: 1 },
  count: { fontSize: 13, opacity: 0.6, marginRight: 4, color: "#fff" },
  skip: { fontSize: 14, fontWeight: "600", opacity: 0.7, color: "#fff" },
  ghost: { paddingVertical: 8, paddingHorizontal: 12 },
  ghostText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  primary: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#208AEF",
  },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
