import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import {
  getRecipeById,
  parseIngredientsField,
  parseInstructionsField,
  type Recipe,
} from "../services/recipesService";
import { updateRecipe, deleteRecipe } from "../lib/recipes";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

type Props = NativeStackScreenProps<AppStackParamList, "Recipe">;

const SURFACE = "#FFFFFF";
const PRIMARY = "#007AFF";
const TEXT_PRIMARY = "#1D1D1F";
const TEXT_SECONDARY = "#8E8E93";

export default function RecipeScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
      navigation.setOptions({ title: "" });
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

  const ingredients = recipe ? parseIngredientsField(recipe.ingredients) : [];
  const instructions = recipe
    ? parseInstructionsField(recipe.instructions)
    : [];

  const enterEdit = () => {
    if (!recipe) return;
    setTitleText(recipe.title ?? "");
    setIngredientsText(ingredients.join("\n"));
    setInstructionsText(instructions.join("\n"));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaving(false);
  };

  const toLines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const onSave = async () => {
    if (!recipe) return;
    if (
      !titleText.trim() ||
      !ingredientsText.trim() ||
      !instructionsText.trim()
    ) {
      Alert.alert("Saknas uppgifter", "Fyll i alla fält innan du sparar.");
      return;
    }
    try {
      setSaving(true);
      await updateRecipe(recipe.id, {
        title: titleText.trim(),
        ingredients: toLines(ingredientsText),
        instructions: instructionsText.trim(),
      });
      setRecipe({
        ...recipe,
        title: titleText.trim(),
        ingredients: toLines(ingredientsText),
        instructions: instructionsText.trim(),
      });
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Kunde inte spara", err?.message ?? "Okänt fel");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!recipe) return;
    Alert.alert(
      "Radera recept",
      "Är du säker på att du vill radera det här receptet? Detta går inte att ångra.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Radera",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteRecipe(recipe.id);
              navigation.goBack();
            } catch (err: any) {
              setDeleting(false);
              Alert.alert(
                "Kunde inte radera",
                err?.message ?? "Okänt fel vid radering."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={[styles.muted, { marginTop: 8 }]}>Fetching recipe…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerFull}>
        <View style={styles.errorBadge}>
          <Text style={{ color: "#DC2626", fontWeight: "800" }}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Unable to load recipe</Text>
        <Text
          style={[styles.muted, { textAlign: "center", marginHorizontal: 24 }]}
        >
          Something went wrong while fetching the recipe. Please try again.
        </Text>
        <Button
          variant="solid"
          action="primary"
          size="md"
          onPress={async () => {
            setRetrying(true);
            await load();
            setRetrying(false);
          }}
          style={[styles.pill, { marginTop: 16, backgroundColor: PRIMARY }]}
        >
          {retrying ? (
            <>
              <ButtonSpinner />
              <ButtonText style={{ marginLeft: 8 }}>Trying again…</ButtonText>
            </>
          ) : (
            <ButtonText>Try Again</ButtonText>
          )}
        </Button>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centerFull}>
        <View style={styles.emptyCircle} />
        <Text style={styles.errorTitle}>Recipe not found</Text>
        <Text
          style={[styles.muted, { textAlign: "center", marginHorizontal: 24 }]}
        >
          We couldn't find the recipe you're looking for. It may have been
          removed.
        </Text>
        <Button
          variant="outline"
          size="md"
          action="primary"
          onPress={() => navigation.goBack()}
          style={[
            styles.pill,
            {
              marginTop: 16,
              backgroundColor: "#F3F4F6",
              borderColor: "#F3F4F6",
            },
          ]}
        >
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  const Content = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.content, { paddingBottom: 160 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        {editing ? (
          <TextInput
            value={titleText}
            onChangeText={setTitleText}
            placeholder="Recipe title"
            style={[styles.input, styles.titleInput]}
            editable={!saving && !deleting}
          />
        ) : (
          <Text style={styles.headerTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
        )}
      </View>

      <Text style={styles.sectionHeader}>Ingredients</Text>
      {editing ? (
        <TextInput
          value={ingredientsText}
          onChangeText={setIngredientsText}
          multiline
          textAlignVertical="top"
          placeholder="Enter ingredients (one per line)"
          style={[styles.input, styles.textareaMedium]}
          editable={!saving && !deleting}
        />
      ) : ingredients.length > 0 ? (
        <View style={{ gap: 10 }}>
          {ingredients.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.bodyText, styles.rowText]}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.muted, { fontStyle: "italic" }]}>
          No ingredients provided.
        </Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionHeader}>Instructions</Text>
      {editing ? (
        <TextInput
          value={instructionsText}
          onChangeText={setInstructionsText}
          multiline
          textAlignVertical="top"
          placeholder="Enter cooking instructions step by step..."
          style={[styles.input, styles.textareaLarge]}
          editable={!saving && !deleting}
        />
      ) : instructions.length > 0 ? (
        <View style={{ gap: 12 }}>
          {instructions.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{i + 1}</Text>
              </View>
              <Text style={[styles.bodyText, styles.rowText]}>{step}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.muted, { fontStyle: "italic" }]}>
          No instructions provided.
        </Text>
      )}

      <View style={{ height: 12 }} />
      <View style={styles.bottomBar}>
        {editing ? (
          <>
            <Button
              variant="solid"
              action="primary"
              size="md"
              onPress={onSave}
              disabled={saving || deleting}
              style={[styles.pill, styles.primaryBtn]}
            >
              {saving ? (
                <>
                  <ButtonSpinner />
                  <ButtonText style={{ marginLeft: 8 }}>Saving…</ButtonText>
                </>
              ) : (
                <ButtonText>Save Changes</ButtonText>
              )}
            </Button>

            <Button
              variant="outline"
              size="md"
              action="primary"
              onPress={cancelEdit}
              disabled={saving || deleting}
              style={[styles.pill, styles.secondaryBtn]}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>

            <Button
              variant="solid"
              size="md"
              action="negative"
              onPress={onDelete}
              disabled={saving || deleting}
              style={[styles.pill, styles.destructiveBtn]}
            >
              {deleting ? (
                <>
                  <ButtonSpinner />
                  <ButtonText style={{ marginLeft: 8, color: "#B91C1C" }}>
                    Deleting…
                  </ButtonText>
                </>
              ) : (
                <ButtonText style={{ color: "#B91C1C" }}>
                  Delete Recipe
                </ButtonText>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="solid"
            action="primary"
            size="md"
            onPress={enterEdit}
            style={[styles.pill, styles.primaryBtn]}
          >
            <ButtonText>Edit Recipe</ButtonText>
          </Button>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      {editing ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {Content}
        </KeyboardAvoidingView>
      ) : (
        Content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: SURFACE,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  bodyText: { fontSize: 16, lineHeight: 22, color: TEXT_PRIMARY },
  rowText: {
    flex: 1,
    flexShrink: 1,
    width: 0,
    lineHeight: 22,
  },
  muted: { color: TEXT_SECONDARY, fontSize: 14 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  titleInput: {
    flex: 1,
    fontWeight: "800",
    fontSize: 20,
  },
  textareaMedium: { minHeight: 110 },
  textareaLarge: { minHeight: 160 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F1F4",
    marginVertical: 18,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
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
  centerFull: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: SURFACE,
  },
  errorBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF1F5",
    marginBottom: 12,
  },
  pill: { borderRadius: 18, height: 52 },
  primaryBtn: { backgroundColor: PRIMARY },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  destructiveBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
});
