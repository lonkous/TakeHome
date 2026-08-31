import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'take-home',
  slug: 'take-home',
  extra: {
    azureClientId: process.env.EXPO_PUBLIC_AZURE_CLIENT_ID,
    azureTenantId: process.env.EXPO_PUBLIC_AZURE_TENANT_ID,
  },
});
