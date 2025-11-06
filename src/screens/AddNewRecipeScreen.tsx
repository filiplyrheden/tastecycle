import { useState } from "react";
import {
  TextInput,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createRecipe } from "../lib/recipes";
import { Button, ButtonText } from "@/components/ui/button";
import { AppStackParamList } from "../../App";

type Props = NativeStackScreenProps<AppStackParamList, "AddNewRecipe">;

export default function AddNewRecipeScreen({ navigation }: Props) {
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
      Alert.alert("Klart!", "Receptet har sparats.");
    } catch (err: any) {
      Alert.alert("Kunde inte spara", err?.message ?? "Okänt fel");
    } finally {
      setAdding(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontWeight: "700", fontSize: 18 }}>Nytt recept</Text>

        <TextInput
          placeholder="Titel"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
        />

        <TextInput
          placeholder="Ingredienser (en per rad)"
          value={ingredientsText}
          onChangeText={setIngredientsText}
          multiline
          style={{
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
            minHeight: 100,
            textAlignVertical: "top",
          }}
        />

        <TextInput
          placeholder="Instruktioner"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          style={{
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
            minHeight: 150,
            textAlignVertical: "top",
          }}
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

        <Button onPress={() => navigation.push("RecipeCollection")}>
          <ButtonText>Visa mina recept</ButtonText>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
