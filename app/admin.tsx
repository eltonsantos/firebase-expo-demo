import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { auth } from "../src/firebase";

export default function Admin() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/");
    }
  }, [user, initializing]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>
      <Text style={styles.subtitle}>Logado como:</Text>
      <Text style={styles.email}>{user.email ?? "(sem email)"}</Text>

      <Pressable
        onPress={async () => {
          await signOut(auth);
          router.replace("/");
        }}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>Sair (logout)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  subtitle: { fontSize: 14, opacity: 0.8 },
  email: { fontSize: 16, fontWeight: "600", marginTop: 8, marginBottom: 24 },
  button: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#b00020",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
