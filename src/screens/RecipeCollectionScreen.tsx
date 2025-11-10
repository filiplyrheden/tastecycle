import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { listMyRecipes, updateRecipe, deleteRecipe } from "../lib/recipes";
import { useEffect, useState } from "react";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { parseListField } from "../services/recipesService";

type Props = NativeStackScreenProps<AppStackParamList, "RecipeCollection">;

type Recipe = {
  id: string;
  title: string;
  ingredients: string[] | string | null;
  instructions: string | string[] | null;
  created_at: string;
};

const BG = "#F2F2F7";
const SURFACE = "#FFFFFF";

function RecipeRow({
  item,
  onChanged,
}: {
  item: Recipe;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [ingredientsText, setIngredientsText] = useState<string>(
    parseListField(item.ingredients).join("\n")
  );
  const [instructions, setInstructions] = useState(
    Array.isArray(item.instructions)
      ? item.instructions.join("\n")
      : item.instructions ?? ""
  );
  const [saving, setSaving] = useState(false);

  async function onSave() {
    try {
      setSaving(true);
      await updateRecipe(item.id, {
        title: title.trim(),
        ingredients: ingredientsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: instructions.trim(),
      });
      setEditing(false);
      onChanged();
    } catch (e: any) {
      Alert.alert("Kunde inte uppdatera", e?.message ?? "Okänt fel");
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    Alert.alert("Ta bort recept", `Vill du ta bort “${item.title}”?`, [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Ta bort",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRecipe(item.id);
            onChanged();
          } catch (e: any) {
            Alert.alert("Kunde inte ta bort", e?.message ?? "Okänt fel");
          }
        },
      },
    ]);
  }

  if (editing) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Edit Recipe</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Ingredients (one per line)</Text>
          <TextInput
            value={ingredientsText}
            onChangeText={setIngredientsText}
            placeholder="Ingredients"
            multiline
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Instructions"
            multiline
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.rowActions}>
          <Button onPress={onSave} disabled={saving} style={styles.pill}>
            {saving ? (
              <>
                <ButtonSpinner />
                <ButtonText style={{ marginLeft: 8 }}>Saving…</ButtonText>
              </>
            ) : (
              <ButtonText>Save</ButtonText>
            )}
          </Button>
          <Button
            variant="outline"
            onPress={() => setEditing(false)}
            style={[styles.pill, styles.secondaryBtn]}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

  const ingredientsList = parseListField(item.ingredients);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.itemTitle]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Pressable onPress={() => setEditing(true)} style={styles.iconBtn}>
            <Text style={styles.iconText}>✏️</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.iconBtn}>
            <Text style={[styles.iconText, { color: "#FF3B30" }]}>🗑️</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.subhead}>Ingredients</Text>
      {ingredientsList.length > 0 ? (
        <View style={{ marginBottom: 8 }}>
          {ingredientsList.map((ing, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{ing}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>No ingredients.</Text>
      )}

      <Button
        variant="outline"
        onPress={() => setExpanded((v) => !v)}
        style={[styles.pill, styles.secondaryBtn]}
      >
        <ButtonText>{expanded ? "Show less" : "Show instructions"}</ButtonText>
      </Button>

      {expanded ? (
        <View style={styles.instructionsWrap}>
          <Text style={styles.subhead}>Instructions</Text>
          <Text style={styles.instructionsText}>
            {Array.isArray(item.instructions)
              ? item.instructions.join("\n")
              : item.instructions}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function RecipeCollectionScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await listMyRecipes();
    setRecipes(data as Recipe[]);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 16, color: "#007AFF" }}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>My Recipes</Text>
        </View>
        <Pressable
          onPress={() => navigation.push("AddNewRecipe")}
          style={styles.addBtn}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>＋</Text>
        </Pressable>
      </View>

      {!loading && recipes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptyText}>
            Start building your recipe collection by adding your first recipe.
          </Text>
          <Button
            onPress={() => navigation.push("AddNewRecipe")}
            style={[styles.pill, { marginTop: 6 }]}
          >
            <ButtonText>Add Recipe</ButtonText>
          </Button>
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <RecipeRow item={item} onChanged={load} />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  list: { flex: 1 },
  listContent: { padding: 16, paddingTop: 8 },

  header: {
    backgroundColor: SURFACE,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1D1D1F" },
  backBtn: {
    padding: 8,
    borderRadius: 10,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 12,
  },
  itemTitle: { fontSize: 18, fontWeight: "700", color: "#1D1D1F", flex: 1 },
  iconBtn: { padding: 6, borderRadius: 10 },
  iconText: { fontSize: 14, color: "#8E8E93" },

  subhead: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E8E93",
    marginTop: 6,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#8E8E93",
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: { fontSize: 14, color: "#1D1D1F", flex: 1 },

  instructionsWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F4",
  },
  instructionsText: { fontSize: 14, lineHeight: 20, color: "#1D1D1F" },

  fieldBlock: { marginTop: 8, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: "700", color: "#8E8E93", marginBottom: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1D1D1F",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textarea: { minHeight: 100 },

  rowActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: { borderRadius: 16, height: 48 },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },

  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF1F5",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1D1D1F" },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 6,
  },

  muted: {
    color: "#8E8E93",
    fontSize: 14,
  },
});
