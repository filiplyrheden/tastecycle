import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useAuth } from "../lib/Authprovider";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [working, setWorking] = useState<"signin" | "signup" | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  async function onSignIn() {
    setErr(null);
    setWorking("signin");
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setErr(e?.message ?? "Sign in failed");
    } finally {
      setWorking(null);
    }
  }

  async function onSignUp() {
    setErr(null);
    setWorking("signup");
    try {
      await signUp(email.trim(), password);
    } catch (e: any) {
      setErr(e?.message ?? "Sign up failed");
    } finally {
      setWorking(null);
    }
  }

  const busy = !!working;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>TasteCycle</Text>
        <Text style={styles.appSubtitle}>Plan your perfect week of meals</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={!busy}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              style={[styles.input, { paddingRight: 64 }]}
              editable={!busy}
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPwd((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPwd ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
        </View>

        {err ? <Text style={styles.error}>{err}</Text> : null}

        <Button
          variant="solid"
          action="primary"
          size="md"
          onPress={onSignIn}
          disabled={busy || !email || !password}
          style={[styles.pill, styles.primaryBtn]}
        >
          {working === "signin" ? (
            <>
              <ButtonSpinner />
              <ButtonText style={{ marginLeft: 8 }}>Signing in…</ButtonText>
            </>
          ) : (
            <ButtonText>Sign In</ButtonText>
          )}
        </Button>

        <Button
          variant="outline"
          size="md"
          action="primary"
          onPress={onSignUp}
          disabled={busy || !email || !password}
          style={[styles.pill, styles.secondaryBtn]}
        >
          {working === "signup" ? (
            <>
              <ButtonSpinner />
              <ButtonText style={{ marginLeft: 8 }}>Creating…</ButtonText>
            </>
          ) : (
            <ButtonText>Create Account</ButtonText>
          )}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  appTitle: { fontSize: 28, fontWeight: "800", color: "#1D1D1F" },
  appSubtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F1F4",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fieldBlock: { marginTop: 8, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: "700", color: "#8E8E93", marginBottom: 6 },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1D1D1F",
    borderWidth: 0,
  },
  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  eyeText: { color: "#8E8E93", fontWeight: "600" },
  pill: {
    borderRadius: 18,
    height: 56,
    marginTop: 10,
  },
  primaryBtn: { backgroundColor: "#007AFF" },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  error: {
    color: "#c00",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
