import { useState } from "react";
import {
  TextInput,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createRecipe } from "../lib/recipes";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { AppStackParamList } from "../../App";

type Props = NativeStackScreenProps<AppStackParamList, "AddNewRecipe">;

const BG = "#F2F2F7";
const SURFACE = "#FFFFFF";

export default function AddNewRecipeScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [adding, setAdding] = useState(false);

  async function onAdd() {
    if (!title.trim() || !ingredientsText.trim() || !instructions.trim()) {
      Alert.alert("Saknas uppgifter", "Fyll i alla fält innan du sparar.");
      return;
    }
    try {
      setAdding(true);
      await createRecipe({
        title: title.trim(),
        ingredients: ingredientsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: instructions.trim(),
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
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Recipe</Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Recipe Title</Text>
            <TextInput
              placeholder="Enter recipe name..."
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              editable={!adding}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Ingredients</Text>
            <TextInput
              placeholder={
                "Enter ingredients (one per line)\n\nExample:\n2 cups flour\n1 tsp salt\n3 eggs"
              }
              value={ingredientsText}
              onChangeText={setIngredientsText}
              multiline
              style={[styles.input, styles.textareaMedium]}
              textAlignVertical="top"
              editable={!adding}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              placeholder="Enter cooking instructions step by step..."
              value={instructions}
              onChangeText={setInstructions}
              multiline
              style={[styles.input, styles.textareaLarge]}
              textAlignVertical="top"
              editable={!adding}
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="solid"
          action="positive"
          size="md"
          onPress={onAdd}
          disabled={adding}
          style={styles.pill}
        >
          {adding ? (
            <>
              <ButtonSpinner />
              <ButtonText style={{ marginLeft: 8 }}>Saving…</ButtonText>
            </>
          ) : (
            <ButtonText>Save Recipe</ButtonText>
          )}
        </Button>

        <Button
          variant="outline"
          size="md"
          action="primary"
          onPress={() => navigation.push("RecipeCollection")}
          disabled={adding}
          style={[styles.pill, styles.secondaryBtn]}
        >
          <ButtonText>View My Recipes</ButtonText>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#1D1D1F",
    marginBottom: 12,
  },

  fieldBlock: { marginTop: 8, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "700", color: "#8E8E93", marginBottom: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1D1D1F",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textareaMedium: { minHeight: 110 },
  textareaLarge: { minHeight: 160 },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: "#EDEDED",
    gap: 10,
  },
  pill: { borderRadius: 18, height: 52 },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
});
