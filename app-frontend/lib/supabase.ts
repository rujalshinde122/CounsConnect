// =============================================================
// CounsConnect App Frontend — Supabase Client
// For React Native / Expo — uses SecureStore for session storage
// =============================================================

import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Stores auth tokens securely in device keychain — not plain AsyncStorage
// This is the production-grade pattern for React Native apps
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,   // Silently refreshes JWT before it expires
    persistSession: true,     // User stays logged in after app restart
    detectSessionInUrl: false, // Not needed in React Native
  },
})
