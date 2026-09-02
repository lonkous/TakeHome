import { Platform } from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
} from "expo-auth-session";
import { entraConfig, entraDiscovery } from "./authConfig";
import {
  clearTokens,
  getStoredTokens,
  isTokenExpired,
  saveTokens,
} from "./tokenStorage";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: entraDiscovery.authorizationEndpoint,
  tokenEndpoint: entraDiscovery.tokenEndpoint,
};

export type GraphUser = {
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string | null;
  userPrincipalName?: string;
  jobTitle?: string | null;
  officeLocation?: string | null;
  id?: string;
};

export default function useMicrosoftAuth() {
  const redirectUri =
    Platform.OS === "web" ? makeRedirectUri() : "takehome://redirect";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: entraConfig.clientId,
      scopes: entraConfig.scopes,
      redirectUri,
    },
    discovery,
  );

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const result = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!result.ok) {
        const body = await result.text().catch(() => "");
        throw new Error(`Graph /me failed: ${result.status} ${body}`);
      }
      const data = (await result.json()) as GraphUser;
      setUser(data);
      return true;
    } catch (err) {
      console.log("Token is invalid:", err);
      setUser(null);
      return false;
    }
  }, []);

  const refreshTokens = useCallback(
    async (refreshToken: string): Promise<string> => {
      const refreshed = await refreshAsync(
        { clientId: entraConfig.clientId, refreshToken },
        discovery,
      );
      await saveTokens({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? refreshToken,
        idToken: refreshed.idToken ?? undefined,
        expiresIn: refreshed.expiresIn ?? undefined,
      });
      return refreshed.accessToken;
    },
    [],
  );

  const restoreSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = await getStoredTokens();
      if (!stored.accessToken) {
        setIsLoggedIn(false);
        setAccessToken(null);
        setUser(null);
        return;
      }

      const signInWith = async (token: string): Promise<boolean> => {
        if (!(await validateToken(token))) return false;
        setAccessToken(token);
        setIsLoggedIn(true);
        return true;
      };

      const tryRefresh = async (): Promise<boolean> => {
        if (!stored.refreshToken) return false;
        try {
          return await signInWith(await refreshTokens(stored.refreshToken));
        } catch {
          return false;
        }
      };

      if (isTokenExpired(stored.expiresAt) && (await tryRefresh())) return;
      if (await signInWith(stored.accessToken)) return;
      if (await tryRefresh()) return;

      await clearTokens();
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [validateToken, refreshTokens]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const params = response.params as Record<string, string>;
      const code = params.code;
      const directAccessToken = params.access_token;

      if (directAccessToken) {
        (async () => {
          setLoading(true);
          setError(null);
          try {
            await saveTokens({ accessToken: directAccessToken });
            const ok = await validateToken(directAccessToken);
            if (ok) {
              setAccessToken(directAccessToken);
              setIsLoggedIn(true);
            } else {
              await clearTokens();
              setError("Token validation failed");
            }
          } finally {
            setLoading(false);
          }
        })();
        return;
      }

      if (!code) {
        setError("No authorization code returned");
        setLoading(false);
        return;
      }

      if (!request?.codeVerifier) {
        setError("Missing PKCE code verifier");
        setLoading(false);
        return;
      }

      (async () => {
        setLoading(true);
        setError(null);
        try {
          const tokenResponse = await exchangeCodeAsync(
            {
              clientId: entraConfig.clientId,
              code,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier! },
            },
            discovery,
          );

          await saveTokens({
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken ?? undefined,
            idToken: tokenResponse.idToken ?? undefined,
            expiresIn: tokenResponse.expiresIn ?? undefined,
          });

          const ok = await validateToken(tokenResponse.accessToken);
          if (!ok) throw new Error("Token validation failed after exchange");

          setAccessToken(tokenResponse.accessToken);
          setIsLoggedIn(true);
        } catch (e) {
          console.error("Token exchange failed:", e);
          setError(e instanceof Error ? e.message : String(e));
          await clearTokens();
          setIsLoggedIn(false);
          setAccessToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else if (response.type === "error") {
      setError(response.error?.message ?? "Authentication error");
      setLoading(false);
    } else if (response.type === "dismiss") {
      setLoading(false);
    }
  }, [response, request, redirectUri, validateToken]);

  const logout = useCallback(async () => {
    await clearTokens();
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    const stored = await getStoredTokens();
    if (!stored.refreshToken) {
      setError("No refresh token available");
      return null;
    }
    try {
      const token = await refreshTokens(stored.refreshToken);
      setAccessToken(token);
      setIsLoggedIn(true);
      return token;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await clearTokens();
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [refreshTokens]);

  return {
    request,
    response,
    promptAsync,
    isLoggedIn,
    accessToken,
    user,
    loading,
    error,
    logout,
    refresh,
    restoreSession,
    validateToken,
  };
}
