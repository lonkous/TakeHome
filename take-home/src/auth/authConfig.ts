const clientId = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID;
const tenantId = process.env.EXPO_PUBLIC_AZURE_TENANT_ID;

if (!clientId || !tenantId) {
  throw new Error(
    'Missing Entra env: set EXPO_PUBLIC_AZURE_CLIENT_ID and EXPO_PUBLIC_AZURE_TENANT_ID (see .env.example)'
  );
}

export const entraConfig = {
  clientId,
  tenantId,
  scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
};

export const entraDiscovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${entraConfig.tenantId}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${entraConfig.tenantId}/oauth2/v2.0/token`,
};
