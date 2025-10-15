import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  createRecipe,
  listMyRecipes,
  updateRecipe,
  deleteRecipe,
} from "../lib/recipes";

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
  const [ingredientsText, setIngredientsText] = useState(
    item.ingredients?.join("\n") ?? ""
  );
  const [instructions, setInstructions] = useState(item.instructions ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          <Button
            title={saving ? "Sparar…" : "Spara"}
            onPress={onSave}
            disabled={saving}
          />
          <Button title="Avbryt" onPress={() => setEditing(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={{ fontWeight: "600" }}>{item.title}</Text>
      {item.ingredients?.map((ing, i) => (
        <Text key={i}>• {ing}</Text>
      ))}
      <Text
        style={{ marginTop: 6, lineHeight: 20 }}
        numberOfLines={expanded ? undefined : 3}
      >
        {item.instructions}
      </Text>
      <Button
        title={expanded ? "Visa mindre" : "Visa instruktioner"}
        onPress={() => setExpanded((v) => !v)}
      />

      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
        <Button title="Redigera" onPress={() => setEditing(true)} />
        <Button title="Ta bort" color="#c0392b" onPress={onDelete} />
      </View>
    </View>
  );
}

export default function ExampleScreen() {
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("500 g pasta\n1 lök");
  const [instructions, setInstructions] = useState("Koka pastan…");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listMyRecipes();
      setRecipes(data as Recipe[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd() {
    try {
      setAdding(true);
      await createRecipe({
        title,
        ingredients: ingredientsText.split("\n").filter(Boolean),
        instructions,
      });
      setTitle("");
      setIngredientsText("");
      setInstructions("");
      await load();
    } catch (err: any) {
      Alert.alert("Kunde inte spara", err?.message ?? "Okänt fel");
    } finally {
      setAdding(false);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 18 }}>Nytt recept</Text>
      <TextInput placeholder="Titel" value={title} onChangeText={setTitle} />
      <TextInput
        placeholder="Ingredienser (en per rad)"
        value={ingredientsText}
        onChangeText={setIngredientsText}
        multiline
      />
      <TextInput
        placeholder="Instruktioner"
        value={instructions}
        onChangeText={setInstructions}
        multiline
      />
      <Button
        title={adding ? "Sparar…" : "Spara recept"}
        onPress={onAdd}
        disabled={adding}
      />

      <View style={{ height: 12 }} />
      <Text style={{ fontWeight: "700", fontSize: 18 }}>Mina recept</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <RecipeRow item={item} onChanged={load} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}
