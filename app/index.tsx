import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { auth } from "../src/firebase";

// Configurar Google Sign-In (apenas para mobile)
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: "253411340512-rs6n3c7f24t3vv5ohfe5kl6v39f6usse.apps.googleusercontent.com",
  });
}

export default function Home() {
  const { user, initializing } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se já estiver logado, redireciona para Admin
    if (!initializing && user) {
      router.replace("/admin");
    }
  }, [user, initializing]);

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

  // Login para MOBILE - usa biblioteca nativa Google Sign-In
  const handleMobileLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o Google Play Services está disponível
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Faz o login com Google
      const signInResult = await GoogleSignin.signIn();

      // Obtém o idToken
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error("Não foi possível obter o token de autenticação");
      }

      console.log("Google Sign-In success, idToken obtained");

      // Autentica no Firebase com o token do Google
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      console.log("Firebase auth success");
      router.replace("/admin");
    } catch (err: any) {
      console.error("Erro no login mobile:", err);

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Login cancelado");
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError("Login já em andamento");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Google Play Services não disponível");
      } else {
        setError("Erro ao fazer login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
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
        onPress={Platform.OS === "web" ? handleWebLogin : handleMobileLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </Pressable>

      <Text style={styles.hint}>
        {Platform.OS === "web" 
          ? "Testando na Web" 
          : "Android - Login Nativo"}
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
