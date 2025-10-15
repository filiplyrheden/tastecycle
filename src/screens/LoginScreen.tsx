import { View, Text, StyleSheet, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.text}>Ingen auth – bara vidare till menyn.</Text>
      <Button title="Gå till Menu" onPress={() => navigation.replace("Menu")} />
      <Button
        title="Gå till Example"
        onPress={() => navigation.replace("Example")}
      />
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
