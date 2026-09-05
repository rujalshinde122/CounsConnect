import { useEffect, useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen, router } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = still loading

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    // Get the initial session (in case user is already logged in from a previous app open)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Wait for fonts AND auth state to be determined before rendering
  if (!loaded || session === undefined) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {session ? (
        // User is authenticated — show main app
        <Stack>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen
            name="+not-found"
            options={{
              title: "Oops!",
              headerShown: true,
            }}
          />
        </Stack>
      ) : (
        // User is not authenticated — show auth screens
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(auth)/login"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="(auth)/register"
            options={{ presentation: "modal" }}
          />
        </Stack>
      )}
    </ThemeProvider>
  );
}