# Larder

Expo SDK 58 pantry app. Paste a Walmart receipt, then cook from what you already have.

Native tabs use the system tab bar on iOS and Android (`expo-router/native-tabs`). The five tabs are Home, Cook, Pantry, List, and Plan.

## Run

```bash
cd mobile
npm install
npx expo start
```

Open it in a development build. Expo Go for SDK 58 was not on the stores yet on the October 15, 2026 release, so a dev build is the supported way to run it on a phone.

Web preview:

```bash
cd mobile
npx expo start --web
```

Data stays on the device. There is no account and no live Walmart login. Walmart does not offer a public shopper purchase API.
