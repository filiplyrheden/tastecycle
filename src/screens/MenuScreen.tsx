import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/Authprovider";
import { generateWeeklyMenu } from "../services/recipesService";
import { saveWeeklyMenuLocal, toWeeklyMenuJSON } from "../utils/menuStorage";
import { replaceRecipesWithAI } from "../services/aiMenuService";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

type Props = NativeStackScreenProps<AppStackParamList, "Menu">;

type DisplayRecipe = {
  id: string;
  title: string;
  ingredients?: string[];
};

async function onSignOut() {
  await await supabase.auth.signOut();
}

export default function MenuScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DisplayRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleSelect = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onGenerate = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      setLoading(true);

      const next = await generateWeeklyMenu(user.id);
      setItems(
        next.map((r) => ({
          id: r.id,
          title: r.title,
          ingredients: r.ingredients
            ? typeof r.ingredients === "string"
              ? [r.ingredients]
              : r.ingredients
            : [],
        }))
      );

      // Bygg JSON och spara lokalt
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
        variant="solid"
        size="md"
        action="positive"
        onPress={() => navigation.push("AddNewRecipe")}
        style={{ borderRadius: 10 }}
      >
        <ButtonText>Nytt recept +</ButtonText>
      </Button>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 8 }}>
          Veckomeny
        </Text>

        <Button
          variant="outline"
          size="md"
          action="primary"
          onPress={onGenerate}
          disabled={loading || !user?.id}
        >
          {loading ? (
            <ButtonSpinner />
          ) : (
            <ButtonText>Generera veckomeny</ButtonText>
          )}
        </Button>

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
          data={items}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => {
            const isSelected = selectedDays.includes(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Recipe", {
                    id: item.id,
                    title: item.title,
                  })
                }
                onLongPress={() => toggleSelect(item.id)}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                  backgroundColor: isSelected ? "#def" : "transparent",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Tryck för detaljer • Långtryck för att markera
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <View style={{ height: 12 }} />
      <Button
        variant="outline"
        size="md"
        action="primary"
        onPress={async () => {
          try {
            const updated = await replaceRecipesWithAI(selectedDays);
            setItems(updated.days.map((d) => ({ id: d.id, title: d.title })));

            console.log("🎉 Meny uppdaterad med AI");
          } catch (err) {
            console.error("AI-fel:", err);
          }
        }}
        disabled={selectedDays.length === 0}
      >
        <ButtonText>Byt ut markerade rätter med AI</ButtonText>
      </Button>

      <Button variant="outline" size="md" action="primary">
        <ButtonText>Generate shopping list</ButtonText>
      </Button>

      <Button variant="outline" size="md" action="primary" onPress={onSignOut}>
        <ButtonText>Logga ut</ButtonText>
      </Button>
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
