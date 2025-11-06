import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { listMyRecipes, updateRecipe, deleteRecipe } from "../lib/recipes";
import { useEffect, useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { parseListField } from "../services/recipesService";

type Props = NativeStackScreenProps<AppStackParamList, "RecipeCollection">;

type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  created_at: string;
};

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
  const [instructions, setInstructions] = useState(item.instructions ?? "");
  const [saving, setSaving] = useState(false);
  const [, setDeleting] = useState(false);

  async function onSave() {
    try {
      setSaving(true);
      await updateRecipe(item.id, {
        title,
        ingredients: ingredientsText.split("\n").filter(Boolean),
        instructions,
      });
      setEditing(false);
      onChanged();
    } catch (e: any) {
      Alert.alert("Kunde inte uppdatera", e?.message ?? "Okänt fel");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    Alert.alert("Ta bort recept", `Vill du ta bort “${item.title}”?`, [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Ta bort",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteRecipe(item.id);
            onChanged();
          } catch (e: any) {
            Alert.alert("Kunde inte ta bort", e?.message ?? "Okänt fel");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (editing) {
    return (
      <View style={{ paddingVertical: 8, gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Redigera</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Titel" />
        <TextInput
          value={ingredientsText}
          onChangeText={setIngredientsText}
          placeholder="Ingredienser (en per rad)"
          multiline
        />
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Instruktioner"
          multiline
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button onPress={onSave} disabled={saving}>
            <ButtonText>{saving ? "Sparar…" : "Spara"}</ButtonText>
          </Button>
          <Button onPress={() => setEditing(false)}>
            <ButtonText>Avbryt</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={{ fontWeight: "600" }}>{item.title}</Text>
      {parseListField(item.ingredients).map((ing, i) => (
        <Text key={i}>• {ing}</Text>
      ))}
      <Text
        style={{ marginTop: 6, lineHeight: 20 }}
        numberOfLines={expanded ? undefined : 3}
      >
        {item.instructions}
      </Text>

      <Button variant="outline" onPress={() => setExpanded((v) => !v)}>
        <ButtonText>
          {expanded ? "Visa mindre" : "Visa instruktioner"}
        </ButtonText>
      </Button>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
        <Button onPress={() => setEditing(true)}>
          <ButtonText>Redigera</ButtonText>
        </Button>

        <Button onPress={onDelete}>
          <ButtonText>Ta bort</ButtonText>
        </Button>
      </View>
    </View>
  );
}

export default function RecipeCollectionScreen(_: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await listMyRecipes();
    setRecipes(data as Recipe[]);
  }

  useEffect(() => {
    load();
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
    <FlatList
      style={styles.list} // gör listan fullhöjd
      contentContainerStyle={styles.content} // padding/gap här
      data={recipes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.rowDivider}>
          <RecipeRow item={item} onChanged={load} />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Inga recept ännu.</Text>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 }, // viktigt för att enable:a scroll
  content: { padding: 16, gap: 12 }, // ersätter din ytter-View
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  emptyWrap: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#666" },
});
