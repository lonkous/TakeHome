import * as React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/auth/AuthContext";
import type { GraphUser } from "@/auth/useMicrosoftAuth";
import { useTourTarget } from "@/lib/tour";

function initials(user: GraphUser | null): string {
  if (!user?.displayName) return "ME";
  return user.displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isEmail(value: string | null | undefined): boolean {
  return !!value && value.includes("@");
}

function displayEmail(user: GraphUser): string | null {
  let candidate = user.mail ?? user.userPrincipalName;
  if (!candidate || !isEmail(candidate)) return null;
  if (candidate.includes("#")) {
    const before = candidate.split("#")[0];
    if (before.includes("@")) {
      candidate = before;
    } else if (before.includes("_")) {
      candidate = before.replace("_", "@");
    } else {
      candidate = before;
    }
  }
  return candidate;
}

export function SignInCard() {
  const { request, promptAsync, error } = useAuth();
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.iconCircle}>
        <ThemedText type="subtitle">◈</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.center}>
        Greetings
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Sign in with your Microsoft account
      </ThemedText>
      <Pressable
        disabled={!request}
        onPress={() => promptAsync()}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="smallBold" style={styles.primaryText}>
          Sign in
        </ThemedText>
      </Pressable>
      {error ? (
        <ThemedText type="small" style={[styles.center, styles.error]}>
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

export function ProfileCard({
  user,
  onSignOut,
}: {
  user: GraphUser;
  onSignOut: () => void;
}) {
  const email = displayEmail(user);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <ThemedText type="subtitle" style={styles.avatarText}>
            {initials(user)}
          </ThemedText>
        </View>
        <View style={styles.nameBlock}>
          <ThemedText type="subtitle" numberOfLines={1}>
            {user.displayName ?? "—"}
          </ThemedText>
          {email ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}
            >
              {email}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {email ? (
        <>
          <View style={styles.divider} />
          <View style={styles.details}>
            <Detail label="Email" value={email} />
          </View>
        </>
      ) : null}

      <Pressable
        onPress={onSignOut}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="smallBold">Sign out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.detailLabel}
      >
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.detailValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

export function ProfileScreenContent() {
  const { isLoggedIn, loading, user, logout } = useAuth();
  const profileRef = useTourTarget("profile");

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <View style={styles.screen}>
        <View
          ref={profileRef as unknown as React.Ref<View>}
          collapsable={false}
          style={styles.cardTarget}
        >
          <SignInCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View
        ref={profileRef as unknown as React.Ref<View>}
        collapsable={false}
        style={styles.cardTarget}
      >
        <ProfileCard user={user} onSignOut={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTarget: {
    width: "100%",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "rgba(127,127,127,0.12)",
  },
  center: {
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#a78bfa",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    color: "#E5484D",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#a78bfa",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(127,127,127,0.2)",
  },
  details: {
    gap: Spacing.two,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
});
