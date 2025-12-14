import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { auth } from "../src/firebase";

// Necessário para completar o fluxo de auth no navegador (mobile)
WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const { user, initializing } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuração para mobile (Expo Go)
  const redirectUri = makeRedirectUri({
    scheme: "firebase-expo-demo",
  });

  console.log("Platform:", Platform.OS);
  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "253411340512-rs6n3c7f24t3vv5ohfe5kl6v39f6usse.apps.googleusercontent.com",
    iosClientId: "253411340512-rs6n3c7f24t3vv5ohfe5kl6v39f6usse.apps.googleusercontent.com",
    androidClientId: "253411340512-rs6n3c7f24t3vv5ohfe5kl6v39f6usse.apps.googleusercontent.com",
    redirectUri,
  });

  useEffect(() => {
    // Se já estiver logado, redireciona para Admin
    if (!initializing && user) {
      router.replace("/admin");
    }
  }, [user, initializing]);

  // Handler para resposta do OAuth mobile
  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;

      const { id_token } = response.params;
      
      if (!id_token) {
        setError("Não foi possível obter o token de autenticação");
        return;
      }

      try {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
        router.replace("/admin");
      } catch (err) {
        console.error("Erro ao fazer login:", err);
        setError("Erro ao fazer login com Google");
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  // Login para WEB - usa popup do Firebase diretamente
  const handleWebLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      await signInWithPopup(auth, provider);
      router.replace("/admin");
    } catch (err: any) {
      console.error("Erro no login web:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Login cancelado");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domínio não autorizado. Adicione localhost no Firebase Console.");
      } else {
        setError("Erro ao fazer login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Login para MOBILE - usa expo-auth-session
  const handleMobileLogin = () => {
    setError(null);
    promptAsync();
  };

  if (initializing || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>
          {loading ? "Fazendo login..." : "Carregando..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Firebase Expo Demo</Text>
      <Text style={styles.subtitle}>Login social com Google + Firebase</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        disabled={Platform.OS !== "web" && !request}
        onPress={Platform.OS === "web" ? handleWebLogin : handleMobileLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
          (Platform.OS !== "web" && !request) && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </Pressable>

      <Text style={styles.hint}>
        {Platform.OS === "web" 
          ? "Testando na Web" 
          : "Usando Expo Go no celular"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: { 
    fontSize: 14, 
    opacity: 0.7, 
    marginBottom: 32, 
    textAlign: "center",
    color: "#666",
  },
  button: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#4285F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
  },
  hint: { 
    marginTop: 24, 
    fontSize: 12, 
    opacity: 0.5, 
    textAlign: "center",
    color: "#888",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    maxWidth: 320,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
});
