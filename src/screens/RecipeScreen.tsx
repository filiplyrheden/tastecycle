import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import {
  getRecipeById,
  parseListField,
  type Recipe,
} from "../services/recipesService";

type Props = NativeStackScreenProps<AppStackParamList, "Recipe">;

export default function RecipeScreen({ route, navigation }: Props) {
  const { id, title: initialTitle } = route.params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
      navigation.setOptions({
        title: data?.title ?? initialTitle ?? "Recipe",
      });
    } catch (e: any) {
      setError(e?.message ?? "Kunde inte hämta receptet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const ingredients = useMemo(
    () => parseListField(recipe?.ingredients),
    [recipe?.ingredients]
  );
  const instructions = useMemo(
    () => parseListField(recipe?.instructions),
    [recipe?.instructions]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Hämtar recept…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Fel: {error}</Text>
        <Text onPress={load} style={styles.link}>
          Försök igen
        </Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Receptet hittades inte.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>{recipe.title}</Text>

      <Text style={styles.sectionHeader}>Ingredienser</Text>
      {ingredients.length > 0 ? (
        <View style={styles.list}>
          {ingredients.map((item, i) => (
            <Text key={i} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>Inga ingredienser angivna.</Text>
      )}

      <Text style={styles.sectionHeader}>Instruktioner</Text>
      {instructions.length > 0 ? (
        <View style={styles.list}>
          {instructions.map((step, i) => (
            <Text key={i} style={styles.listItem}>
              {step}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>Inga instruktioner angivna.</Text>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
  },
  list: { gap: 6 },
  listItem: { fontSize: 16, lineHeight: 22 },
  muted: { color: "#666", marginTop: 8 },
  error: { color: "#c00", fontWeight: "600", textAlign: "center" },
  link: {
    marginTop: 8,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
