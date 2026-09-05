<p align="center">
  <img src="./assets/images/time_is_money_icon.png" width="96" alt="TimeIsMoney icon" />
</p>

<h1 align="center">Time Is Money ⏱️💰</h1>

<p align="center">
  A mobile app that treats your time as currency — earn it by being productive, spend it on guilt-free fun, and pay the price (interest, penalties, even "bankruptcy") if you overspend.
</p>

<p align="center">
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=fff" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=000" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=fff" />
  <img alt="Platforms" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey" />
</p>

---

## Concept

**Time Is Money** turns personal time management into a personal-finance simulator. Run a stopwatch while you work: time earned in **Productive Mode** deposits into your balance ("the Bank"). Time spent doomscrolling or gaming can be tracked in **Wasting Mode**, which debits your balance instead.

Your balance then behaves like real money:
- Redeem it in the **Shop** for rewards you've defined yourself (a YouTube break, a gaming session, a movie night).
- Run low? Take out a **loan** — at a cost.
- Go too deep into debt and the app starts charging **penalties**, and eventually locks you out entirely.

It's a lightweight behavioral tool for people who want their leisure time to feel *earned*, built as a self-contained, offline-first Expo app.

## Features

- ⏱️ **Live stopwatch timer** with millisecond precision, animated background that shifts between "productive" (cool blues) and "wasting" (warm pinks/reds), and a swipe gesture to switch modes.
- 🏦 **Persistent time balance** stored locally, carried across every screen.
- 🛍️ **Customizable Shop** — add, edit, delete, pin, and reorder your own reward items with a name, cost (in minutes), icon, and color.
- 📉 **Debt system** — going negative isn't free:
  - Tiered penalties at 1h and 2h of debt.
  - Recurring fines for every additional hour spent beyond 2h in debt.
  - A hard **6-hour debt ceiling** that locks the Shop entirely ("Bankruptcy Declared").
- 💳 **Loans** — can't afford an item? Take a loan at a **10% interest rate** instead of being blocked outright.
- 📜 **History log** — a full, reverse-chronological ledger of every earn/spend transaction, with relative timestamps ("5m ago") and editable notes.
- 👋 **First-launch onboarding** — a 3-slide walkthrough explaining the mechanics, shown once and remembered via local storage.
- 🌓 Automatic light/dark support and a responsive layout tuned for iOS, Android, and web from a single codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 (managed workflow), React Native 0.81, React 19 |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, typed routes) + React Navigation bottom tabs |
| Language | JavaScript (screens/components) on a TypeScript-strict project base |
| State management | React Context (`CurrencyContext`) — no external state library |
| Persistence | `@react-native-async-storage/async-storage` (fully offline, on-device) |
| Animation / gestures | `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, RN `Animated` |
| UI | `@expo/vector-icons` (FontAwesome6), custom `StyleSheet`-based styling |
| New Architecture | Enabled (`newArchEnabled`), React Compiler experiment enabled |
| Build & deploy | [EAS Build](https://docs.expo.dev/build/introduction/) — development, preview (Android APK), and production profiles configured in `eas.json` |
| Tooling | ESLint 9 (flat config, `eslint-config-expo`), TypeScript 5.9 |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- npm
- [Expo Go](https://expo.dev/go) on your phone, or an Android/iOS emulator, for local testing

### Install & run

```bash
# install dependencies
npm install

# start the Metro bundler / dev server
npm start

# or target a platform directly
npm run android
npm run ios
npm run web
```

Scan the QR code with Expo Go (or press `a` / `i` in the terminal) to launch the app.

### Building with EAS

```bash
npx eas build --profile development   # dev client build
npx eas build --profile preview       # internal Android APK
npx eas build --profile production    # store-ready build
```

## Project Structure

```
app/                      Expo Router screens (file-based routing)
├─ _layout.jsx            Root layout — wraps app in CurrencyProvider, defines bottom tabs
├─ index.jsx              Timer screen (default route) — earn/waste stopwatch
├─ shop.jsx                Shop screen — rewards, purchases, loans, item management
└─ history.jsx            History screen — transaction ledger

components/
└─ OnboardingModal.jsx     First-launch tutorial (3-slide walkthrough)

context/
└─ CurrencyContext.jsx     Core domain logic — balance, history, shop items,
                            debt/penalty/interest rules, AsyncStorage persistence

assets/                    App icons, splash screens, images
eas.json                   EAS Build profiles (development/preview/production)
app.json                   Expo app config (icons, splash, plugins, bundle IDs)
```

## How the Economy Works

| Rule | Value |
|---|---|
| Loan interest | 10% added on top of the item's time cost |
| Debt penalty thresholds | +10 min at 1h debt, +30 min at 2h debt |
| Recurring debt fine | +30 min for every additional hour past 2h in debt |
| Bankruptcy limit | 6 hours in debt — Shop locks completely |

All of these constants live in [`context/CurrencyContext.jsx`](context/CurrencyContext.jsx) and are easy to tune.

## Roadmap / Known Issues

Development has been tracked through GitHub Issues, with most early UI/logic bugs (shop editing, item reordering, timer mode switching, negative balance handling) resolved. Currently open:

- History view: overflow characters in long log notes ([#13](https://github.com/goosetaph/TimeIsMoney/issues/13))

## Author

Built and maintained by [goosetaph](https://github.com/goosetaph).
