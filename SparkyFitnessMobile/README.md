# Sparky Fitness Mobile

Native iPhone and Android app for SparkyFitness, built with Expo and React Native.

## iPhone setup

1. Copy `.env.example` to `.env` and set at least:
   - `APP_VARIANT=development`
   - `DEFAULT_SERVER_URL=http://YOUR-MAC-OR-SERVER-LAN-IP:8080`
   - `IOS_BUNDLE_IDENTIFIER=com.yourname.sparkyfitness`
   - `IOS_DEV_BUNDLE_IDENTIFIER=com.yourname.sparkyfitness.dev`
   - `IOS_APPLE_TEAM_ID=YOURTEAMID`
2. Install dependencies:

```bash
corepack enable
corepack pnpm install
```

3. Build and install the dev app on a connected iPhone:

```bash
corepack pnpm prebuild:ios
corepack pnpm ios:device
```

4. For a standalone release-style install on your own iPhone:

```bash
APP_VARIANT=development corepack pnpm ios:release
```

5. For App Store / production builds:

```bash
APP_VARIANT=production eas build -p ios --profile production
```

## Notes

- Use your server's LAN IP from the iPhone, not `localhost`.
- Non-production builds can connect to local `http://` servers. Production builds require `https://`.
- The app only prefills the server URL from `DEFAULT_SERVER_URL`; the API key is still entered in-app.
