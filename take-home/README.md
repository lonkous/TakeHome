# Take Home - Expo Universal App

Cross-platform app built with Expo running Android / Web (Web was with limitations) from a single codebase. Features Microsoft Entra ID authentication, Azure Cosmos DB data layer, animated charts, and a guided tour.

## Key Features

### 1. Microsoft Entra ID Authentication (`src/auth/`)

OAuth 2.0 `expo-auth-session` against `https://login.microsoftonline.com/{tenant}/oauth2/v2.0`.

- `authConfig.ts` - validates `EXPO_PUBLIC_AZURE_CLIENT_ID` / `EXPO_PUBLIC_AZURE_TENANT_ID`, exposes `entraConfig` scopes (`openid profile email offline_access User.Read`) and discovery endpoints.
- `useMicrosoftAuth.ts` - core hook: `useAuthRequest` plus `exchangeCodeAsync` / `refreshAsync`, JWT validation against `https://graph.microsoft.com/v1.0/me`, token refresh with expiry buffer. Handles `takehome://redirect` (native) vs `makeRedirectUri()` (web).
- `tokenStorage.ts` - platform-aware persistence: `localStorage` on web, `expo-secure-store` on native; keys `auth.{accessToken,refreshToken,idToken,expiresAt}`; `isTokenExpired` with 60s buffer.
- `AuthContext.tsx` - React Context provider consumed via `useAuth()`; wraps the entire app in `src/app/_layout.tsx:13`.
- `profile-card.tsx` - `SignInCard` and `ProfileCard`.

### 2. Dashboard and Data Visualization (`src/app/dashboard.tsx`, `src/components/chart.tsx`, `src/services/cosmos/`)

- API route `src/app/api/datas+api.ts:1` - `GET /api/datas` lazily initializes Cosmos DB then returns `Response.json(getAllData())`.
- Cosmos service `src/services/cosmos/config.ts` and `data.service.ts` (CRUD: `getAllData`, `getDataById`, `createData`, `upsertData`, `deleteData` with mapped `TData` to `CosmosData` and `handleCosmosError`).
- Dashboard fetches `/api/datas`, maps `id` to `month` and `value` to `value` sorted by `id`, handles `loading` / `error` / `empty` states. Web renders lightweight div bars (`width: min(value,100)%`); Native lazy-requires `Chart` via `victory-native` plus `@shopify/react-native-skia` (`CartesianChart` with `Bar` plus `LinearGradient` `#a78bfa` to `#a78bfa50`).

### 3. Guided App Tour (`src/components/app-tour-provider.tsx`, `src/lib/tour*`)

Powered by `guideway` (native).

- `tours` definition: `main` with 3 steps `chart` ("Chart Data"), `key` ("Months"), `profile`.
- `help-button.tsx` - `Show me around` button calls `start('main')`; integrated in `dashboard.tsx` and `profile-card.tsx` via `useTourTarget`.

## Tech Stack

- `victory-native` 42 plus `@shopify/react-native-skia` - charts on native
- `zod` 4.5 - schema validation (`src/schemas/data.schema.ts`, env)
- `@azure/cosmos` 4.10 - Cosmos DB client (`src/services/cosmos/`)
- `bun` - package manager and runtime
- `guideway` 0.4.1 - native guided tour (`src/lib/tour*`, `src/components/app-tour-provider.tsx`)

## Getting Started

### Prerequisites

- Node 20+ / Bun
- Expo CLI (`bunx expo`)
- Azure Entra app registration (client ID plus tenant ID) and Cosmos DB account (endpoint plus key)

### 1. Install dependencies

```bash
bun install
```

For Expo Go / EAS, set these as `EXPO_PUBLIC_*` env vars in your EAS project or `app.config.ts:8` `extra`.

### 2. Start the app

```bash
bunx expo start          # QR plus dev tools (choose iOS/Android/Web)
bunx expo start --web    # web only
bunx expo start --tunnel # Mobile but with Expo Go
bun run android          # native Android build
```

The original template command `bunx expo start --start` in the starter README is not a valid Expo flag - use `bunx expo start` instead.

## API Routes

| Method | Route        | Description                                                                            |
| ------ | ------------ | -------------------------------------------------------------------------------------- |
| `GET`  | `/api/datas` | Returns all `TData[]` from Cosmos container `TakeHomeC` (`src/app/api/datas+api.ts:6`) |

## Personal Decisions Made

- Picked Unknown over any whenever possible
- Did not implement/Test anything for IOS due to time constraints and not being in the ecosystem
- Tried to use as much off the shelf packages for better Code duration as there will opensource developers working on the projects ie guideway
- I picked purple as my accent but was kind of arbitrary as i did not have and design guidelines(just tried what personally looked best).

## Future Implementations

- Tests hahaha. I Ideally would have done them but was due to time constraints.
- More dynamic chart as currently I only have one set of data that does reveal to much. e.g options for 1 week/month/year
- probably move profile in with a settings tab into a burger drop down.
- knowing more about the project would also effect the decisions I made.

## Project Structure

```
.
- app.config.ts            # Expo config, injects azureClientId/azureTenantId into extra
- app.json                 # Expo metadata (name, icons, splash, router typedRoutes plus reactCompiler)
- src/
  - app/                   # expo-router file-based routing
    - _layout.tsx          # Root layout: AuthProvider, SafeAreaProvider, AppTourProvider, ThemeProvider plus AppTabs and AnimatedSplashOverlay
    - index.tsx            # "/" - Profile tab (ProfileScreenContent centered in ThemedView)
    - dashboard.tsx        # "/dashboard" - fetches /api/datas, renders Chart (native) or bar list (web)
    - redirect.tsx         # "/redirect" - OAuth redirect, routes to /dashboard or / via useAuth()
    - api/
      - datas+api.ts       # GET /api/datas - Cosmos DB read
  - auth/                  # Microsoft Entra auth
    - authConfig.ts
    - useMicrosoftAuth.ts
    - tokenStorage.ts
    - AuthContext.tsx
  - services/cosmos/       # Azure Cosmos DB (@azure/cosmos 4.10)
    - config.ts            # initializeCosmosDB, getDataContainer, handleCosmosError
    - data.service.ts
  - schemas/
    - data.schema.ts       # Zod dataSchema / responseSchema
  - components/
    - chart.tsx                    # victory-native CartesianChart
    - profile-card.tsx             # SignInCard / ProfileCard / ProfileScreenContent
    - app-tour-provider.tsx        # Tour definition (guideway)
    - app-tabs.tsx / app-tabs.web.tsx
  - lib/
    - tour.ts / tour.native.ts / tour.web.ts  # platform-specific tour exports
  - hooks/
    - use-theme.ts
    - use-color-scheme.ts / .web.ts
  - constants/
    - theme.ts
  - config/
    - env.ts               # client env (EXPO_PUBLIC_*)
    - env.server.ts        # server env (Cosmos) - lazy Proxy
- assets/images/           # icons, splash, adaptive icons
- example/                 # reference example (cloned)
```

`.native.ts` / `.web.ts` suffixes are resolved automatically by Metro - native files are excluded from web bundles and vice versa.

## Sources Used

- [Microsoft Blog - Getting started with Azure Cosmos DB SDK for TypeScript/JavaScript 4.2.0](https://techcommunity.microsoft.com/blog/educatordeveloperblog/getting-started-with-azure-cosmos-db-sdk-for-typescriptjavascript-4-2-0/4345532)
- [Guideway Documentation](https://guideway.dev/docs/quick-start/)
