import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="admin" options={{ title: "Admin" }} />
      </Stack>
    </AuthProvider>
  );
}
