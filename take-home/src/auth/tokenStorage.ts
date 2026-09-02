import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
  idToken: "auth.idToken",
  expiresAt: "auth.expiresAt",
} as const;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(params: {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}): Promise<void> {
  const expiresAt = params.expiresIn
    ? String(Date.now() + params.expiresIn * 1000)
    : null;

  await setItem(KEYS.accessToken, params.accessToken);
  if (params.refreshToken)
    await setItem(KEYS.refreshToken, params.refreshToken);
  else await removeItem(KEYS.refreshToken);

  if (params.idToken) await setItem(KEYS.idToken, params.idToken);
  else await removeItem(KEYS.idToken);

  if (expiresAt) await setItem(KEYS.expiresAt, expiresAt);
  else await removeItem(KEYS.expiresAt);
}

export async function getStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
}> {
  const [accessToken, refreshToken, idToken, expiresAtStr] = await Promise.all([
    getItem(KEYS.accessToken),
    getItem(KEYS.refreshToken),
    getItem(KEYS.idToken),
    getItem(KEYS.expiresAt),
  ]);

  return {
    accessToken,
    refreshToken,
    idToken,
    expiresAt: expiresAtStr ? Number(expiresAtStr) : null,
  };
}

export async function clearTokens(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => removeItem(k)));
}

export function isTokenExpired(
  expiresAt: number | null,
  bufferSeconds = 60,
): boolean {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - bufferSeconds * 1000;
}
