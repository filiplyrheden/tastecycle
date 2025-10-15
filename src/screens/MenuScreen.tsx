import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";

type Props = NativeStackScreenProps<AppStackParamList, "Menu">;

const items = [
  { id: "1", title: "Spaghetti & köttfärssås" },
  { id: "2", title: "Kycklinggryta" },
  { id: "3", title: "Vegolasagne" },
];

export default function MenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.push("Recipe", { title: item.title })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardHint}>Tryck för recept</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      <View style={{ height: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardHint: { fontSize: 12, color: "#666", marginTop: 4 },
});
