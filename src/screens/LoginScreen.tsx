import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../App";
import { useAuth } from "../lib/Authprovider";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSignIn() {
    setErr(null);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setErr(e.message ?? "Sign in failed");
    }
  }

  async function onSignUp() {
    setErr(null);
    try {
      await signUp(email.trim(), password);
    } catch (e: any) {
      setErr(e.message ?? "Sign up failed");
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}
      <Button title="Logga in" onPress={onSignIn} />
      <Button title="Skapa konto" onPress={onSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 12 },
});
