import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { entraConfig, entraDiscovery } from './authConfig';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: entraDiscovery.authorizationEndpoint,
  tokenEndpoint: entraDiscovery.tokenEndpoint
};

export default function useMicrosoftAuth() {
  const redirectUri = makeRedirectUri({ scheme: 'takehome' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: entraConfig.clientId,
      scopes: entraConfig.scopes,
      redirectUri: makeRedirectUri({
        scheme: 'takehome'
      }),
    },
    discovery
  );
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    validateToken(token);
  }, []);


  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
    }
  }, [response]);

  useEffect(() => {
    if (response?.type === 'success') {
      setIsLoggedIn(true);
    }
  }, [response]);

  async function validateToken(token: string) {
    try {
      // Example: validate by calling Microsoft Graph
      const result = await fetch(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!result.ok) {
        throw new Error('Token is invalid or expired');
      }

      const user = await result.json();

      console.log('Token is valid:', user);

      setAccessToken(token);
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Token is invalid:', error);

      localStorage.removeItem('accessToken');
      setAccessToken("");
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }
  return {
    request,
    response,
    promptAsync,
    isLoggedIn
  };
}
