# CounsConnect — Mobile Frontend

The cross-platform mobile application for CounsConnect clients and patients. Built with React Native and Expo, featuring file-based routing and secure hardware-backed authentication through Supabase.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Expo SDK](https://docs.expo.dev/) | `52.0.49` | Universal app toolchain & runtime |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | `4.0.22` | File-system-based native routing |
| **Runtime** | [React Native](https://reactnative.dev/) | `0.76.9` | Cross-platform mobile runtime (iOS & Android) |
| **UI Library** | [React](https://react.dev/) | `18.3.1` | Component lifecycle & state |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.x` | Strict typing across components & APIs |
| **Database & Auth** | [Supabase JS](https://supabase.com/docs/reference/javascript/introduction) | `^2.112.4` | Real-time PostgreSQL client & Auth |
| **Secure Storage** | `expo-secure-store` | `^57.0.1` | Hardware keychain storage for auth tokens |

---

## 📁 Directory Structure & Routing

```text
app-frontend/
├── app/
│   ├── (auth)/                     # Unauthenticated screens
│   │   ├── login.tsx               # Client sign-in screen
│   │   └── register.tsx            # Client registration screen
│   ├── (main)/                     # Authenticated client screens
│   │   ├── _layout.tsx             # Bottom tab navigation bar
│   │   ├── home.tsx                # Client home dashboard
│   │   ├── schedule.tsx            # Appointment booking & calendar
│   │   ├── journal.tsx             # Client private mood & therapy journal
│   │   ├── chatbot.tsx             # Supportive guidance / mental wellness assistant
│   │   └── profile.tsx             # Client profile & settings
│   ├── _layout.tsx                 # Root layout & navigation providers
│   ├── index.tsx                   # Splash / Auth state redirector
│   └── +not-found.tsx              # 404 fallback screen
│
├── components/                     # Reusable mobile UI components
│   ├── Appointments.tsx            # Appointment list & card components
│   ├── Task.tsx                    # Client homework/exercise task item
│   ├── ThemedText.tsx              # Theme-aware typography component
│   ├── ThemedView.tsx              # Theme-aware container component
│   └── ui/                         # Icon and tab navigation elements
│
├── constants/
│   └── Colors.ts                   # Color tokens for light and dark modes
│
├── hooks/                          # Custom hooks (color scheme, themes)
│
├── lib/
│   └── supabase.ts                 # Supabase client with Expo SecureStore adapter
│
├── assets/                         # Icons, splash screens, and custom fonts
├── .env.example                    # Mobile environment variable template
├── app.json                        # Expo configuration manifest
└── package.json                    # Dependencies and scripts
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v20+ recommended (v18.18+ minimum)
- **npm**: v9+
- **Expo Go** app on your physical device (iOS App Store or Google Play Store), or an iOS Simulator / Android Emulator.

### 2. Installation & Setup

```bash
# 1. Navigate to the mobile app directory
cd app-frontend

# 2. Copy the environment variables template
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start the Expo development server
npx expo start
```

Scan the QR code printed in your terminal with your phone camera (iOS) or the Expo Go app (Android).

---

## 🔐 Environment Variables

Create `.env` inside `app-frontend/` based on `.env.example`:

```env
# =============================================================
# CounsConnect Mobile App — Environment Configuration
# =============================================================
EXPO_PUBLIC_SUPABASE_URL=http://<AZURE_VM_IP_OR_DOMAIN>:8000
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note**: Variables prefixed with `EXPO_PUBLIC_` are bundled into the JavaScript runtime. Never commit `.env` to version control.

---

## 🔒 Authentication & Keychain Security

Authentication sessions are securely persisted in the device's hardware keychain using `expo-secure-store` inside [`lib/supabase.ts`](./lib/supabase.ts):

- **Automatic Token Refresh**: Supabase silently refreshes expired access tokens before API calls.
- **Session Persistence**: Users remain logged in across application restarts without storing raw tokens in unencrypted `AsyncStorage`.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run start` or `npx expo start` | Launches Metro bundler and displays QR code |
| `npm run ios` | Opens app directly in the macOS iOS Simulator |
| `npm run android` | Opens app directly in the Android Emulator |
| `npm run web` | Runs the Expo application in a browser window |
| `npm run lint` | Runs ESLint checks |
