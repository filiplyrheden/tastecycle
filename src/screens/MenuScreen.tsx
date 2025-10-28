import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/Authprovider";
import { generateWeeklyMenu, Recipe } from "../services/recipesService";
import { saveWeeklyMenuLocal, toWeeklyMenuJSON } from "../utils/menuStorage";

type Props = NativeStackScreenProps<AppStackParamList, "Menu">;

async function onSignOut() {
  await await supabase.auth.signOut();
}

export default function MenuScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      setLoading(true);

      const next = await generateWeeklyMenu(user.id);
      setItems(next);

      // 🧾 Bygg JSON och spara lokalt
      const menuJson = toWeeklyMenuJSON(
        next.map((r) => ({
          id: r.id,
          title: r.title,
          ingredients:
            typeof r.ingredients === "string"
              ? [r.ingredients]
              : r.ingredients ?? [],
          servings: 4,
        })),
        user.id
      );

      const savedPath = await saveWeeklyMenuLocal(menuJson);
      console.log("✅ Veckomeny sparad:", savedPath);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <Button
        title="Nytt recept +"
        onPress={() => navigation.push("Example")}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 8 }}>
          Veckomeny
        </Text>

        <Button
          title="Generera veckomeny"
          onPress={onGenerate}
          disabled={loading || !user?.id}
        />

        {loading && (
          <View style={{ marginTop: 12 }}>
            <ActivityIndicator />
          </View>
        )}

        {error && (
          <Text style={{ color: "tomato", marginTop: 12 }}>{error}</Text>
        )}

        {!loading && items.length === 0 && !error && (
          <Text style={{ marginTop: 12 }}>
            Inga recept ännu – lägg till ditt första recept!
          </Text>
        )}

        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {item.title}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={{ height: 12 }} />
      <Button title="Get AI-suggestion" />
      <Button title="Generate shopping list" />
      <Button title="Konto" onPress={() => navigation.push("Account")} />
      <Button title="Logga ut" onPress={onSignOut} />
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
