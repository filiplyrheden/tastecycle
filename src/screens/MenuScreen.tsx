import { View, Text, StyleSheet } from "react-native";

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.text}>Veckomeny kommer här.</Text>
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
  text: { fontSize: 16, color: "#555", textAlign: "center" },
});
