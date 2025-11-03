import { useState } from "react";
import { View, TextInput, Text, Alert } from "react-native";
import { createRecipe } from "../lib/recipes";
import { Button, ButtonText } from "@/components/ui/button";

export default function AddNewRecipeScreen() {
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [adding, setAdding] = useState(false);

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
        variant="solid"
        size="md"
        action="positive"
        onPress={onAdd}
        disabled={adding}
      >
        <ButtonText>{adding ? "Sparar…" : "Spara recept"}</ButtonText>
      </Button>
    </View>
  );
}
