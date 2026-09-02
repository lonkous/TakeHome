import { Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
} from 'expo-auth-session';
import { entraConfig, entraDiscovery } from './authConfig';
import {
  clearTokens,
  getStoredTokens,
  isTokenExpired,
  saveTokens,
} from './tokenStorage';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: entraDiscovery.authorizationEndpoint,
  tokenEndpoint: entraDiscovery.tokenEndpoint,
};

type AuthError = string | null;

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
    Platform.OS === 'web'
      ? makeRedirectUri({ scheme: undefined } as any)
      : 'takehome://redirect';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: entraConfig.clientId,
      scopes: entraConfig.scopes,
      redirectUri,
    },
    discovery
  );

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const result = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!result.ok) {
        const body = await result.text().catch(() => '');
        throw new Error(`Graph /me failed: ${result.status} ${body}`);
      }
      const data = (await result.json()) as GraphUser;
      setUser(data);
      return true;
    } catch (err) {
      console.log('Token is invalid:', err);
      setUser(null);
      return false;
    }
  }, []);

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

      if (isTokenExpired(stored.expiresAt) && stored.refreshToken) {
        try {
          const refreshed = await refreshAsync(
            {
              clientId: entraConfig.clientId,
              refreshToken: stored.refreshToken,
            },
            discovery
          );
          await saveTokens({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? stored.refreshToken,
            idToken: refreshed.idToken ?? undefined,
            expiresIn: refreshed.expiresIn ?? undefined,
          });
          const isValid = await validateToken(refreshed.accessToken);
          if (isValid) {
            setAccessToken(refreshed.accessToken);
            setIsLoggedIn(true);
            return;
          }
        } catch (e) {
          console.log('Refresh failed, will validate existing token', e);
        }
      }

      const isValid = await validateToken(stored.accessToken);
      if (isValid) {
        setAccessToken(stored.accessToken);
        setIsLoggedIn(true);
      } else {
        if (stored.refreshToken) {
          try {
            const refreshed = await refreshAsync(
              { clientId: entraConfig.clientId, refreshToken: stored.refreshToken },
              discovery
            );
            const isRefreshedValid = await validateToken(refreshed.accessToken);
            if (isRefreshedValid) {
              await saveTokens({
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken ?? stored.refreshToken,
                idToken: refreshed.idToken ?? undefined,
                expiresIn: refreshed.expiresIn ?? undefined,
              });
              setAccessToken(refreshed.accessToken);
              setIsLoggedIn(true);
              return;
            }
          } catch { }
        }
        await clearTokens();
        setAccessToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [validateToken]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const code = (response.params as Record<string, string>).code;
      const directAccessToken = (response.params as Record<string, string>).access_token;

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
              setError('Token validation failed');
            }
          } finally {
            setLoading(false);
          }
        })();
        return;
      }

      if (!code) {
        setError('No authorization code returned');
        setLoading(false);
        return;
      }

      if (!request?.codeVerifier) {
        setError('Missing PKCE code verifier');
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
            discovery
          );

          await saveTokens({
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken ?? undefined,
            idToken: tokenResponse.idToken ?? undefined,
            expiresIn: tokenResponse.expiresIn ?? undefined,
          });

          const ok = await validateToken(tokenResponse.accessToken);
          if (!ok) throw new Error('Token validation failed after exchange');

          setAccessToken(tokenResponse.accessToken);
          setIsLoggedIn(true);
        } catch (e) {
          const raw = e instanceof Error ? e.message : String(e);
          let msg = raw;
          if (raw.includes('AADSTS9002326') || raw.includes('Cross-origin token redemption')) {
            msg = `AADSTS9002326: Add SPA platform with ${redirectUri} and http://localhost:8081 in Entra. Raw: ${raw}`;
          } else if (raw.includes('AADSTS50011') || raw.includes('redirect URI')) {
            msg = `AADSTS50011: Redirect URI mismatch. Add exactly "${redirectUri}" (+ http://localhost:8081) to Entra -> App registrations -> Authentication. Raw: ${raw}`;
          }
          console.log('exchangeCodeAsync failed', msg);
          setError(msg);
          await clearTokens();
          setIsLoggedIn(false);
          setAccessToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else if (response.type === 'error') {
      const raw = response.error?.message ?? 'Authentication error';
      let msg = raw;
      if (raw.includes('AADSTS50011') || raw.includes('redirect URI')) {
        msg = `AADSTS50011: Add "${redirectUri}" to Entra redirect URIs. Raw: ${raw}`;
      }
      setError(msg);
      setLoading(false);
    } else if (response.type === 'dismiss') {
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
      setError('No refresh token available');
      return null;
    }
    try {
      const refreshed = await refreshAsync(
        { clientId: entraConfig.clientId, refreshToken: stored.refreshToken },
        discovery
      );
      await saveTokens({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? stored.refreshToken,
        idToken: refreshed.idToken ?? undefined,
        expiresIn: refreshed.expiresIn ?? undefined,
      });
      setAccessToken(refreshed.accessToken);
      setIsLoggedIn(true);
      return refreshed.accessToken;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      await clearTokens();
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

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
