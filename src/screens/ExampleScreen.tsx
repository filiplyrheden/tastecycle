import { useEffect, useState } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import { createRecipe, listMyRecipes } from "../lib/recipes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Example">;

export default function ExampleScreen() {
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("500 g pasta\n1 lök");
  const [instructions, setInstructions] = useState("Koka pastan...");
  const [recipes, setRecipes] = useState<any[]>([]);

  async function load() {
    const data = await listMyRecipes();
    setRecipes(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd() {
    await createRecipe({
      title,
      ingredients: ingredientsText.split("\n").filter(Boolean),
      instructions,
    });
    setTitle("");
    setIngredientsText("");
    setInstructions("");
    await load();
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
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
      <Button title="Spara recept" onPress={onAdd} />

      <FlatList
        data={recipes}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
            {item.ingredients?.map((ing: string, i: number) => (
              <Text key={i}>• {ing}</Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}
