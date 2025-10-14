import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useLayoutEffect } from "react";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Recipe">;

export default function RecipeScreen({ route, navigation }: Props) {
  const title = route.params?.title ?? "Recipe";

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.p}>Ingredienser, steg och bilder kommer här.</Text>
      <Text style={styles.small}>
        Svep från vänster eller tryck ← för att gå tillbaka.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  h1: { fontSize: 22, fontWeight: "700" },
  p: { fontSize: 16, color: "#333" },
  small: { fontSize: 12, color: "#777", marginTop: 8 },
});
