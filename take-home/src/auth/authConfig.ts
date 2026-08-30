export const entraConfig = {
  clientId: '31d23f2d-c346-4874-b840-1e8fdb52d608',

  tenantId: 'd3617a8b-b545-4981-a820-4628a05e0c64',

   scopes: [
    'openid',
    'profile',
    'email',
    'offline_access',
  ],
};

export const entraDiscovery = {
  authorizationEndpoint:
    `https://login.microsoftonline.com/${entraConfig.tenantId}/oauth2/v2.0/authorize`,

  tokenEndpoint:
    `https://login.microsoftonline.com/${entraConfig.tenantId}/oauth2/v2.0/token`,
};
