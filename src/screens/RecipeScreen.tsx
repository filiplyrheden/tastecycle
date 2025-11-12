import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import {
  getRecipeById,
  parseListField,
  type Recipe,
} from "../services/recipesService";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

type Props = NativeStackScreenProps<AppStackParamList, "Recipe">;

const BG = "#F2F2F7";
const SURFACE = "#FFFFFF";
const PRIMARY = "#007AFF";
const TEXT_PRIMARY = "#1D1D1F";
const TEXT_SECONDARY = "#8E8E93";

export default function RecipeScreen({ route, navigation }: Props) {
  const { id, title: initialTitle } = route.params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
      navigation.setOptions({
        title: "",
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

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionHeader}>Ingredients</Text>
        {ingredients.length > 0 ? (
          <View style={{ gap: 10 }}>
            {ingredients.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bodyText}>{item}</Text>
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
        {instructions.length > 0 ? (
          <View style={{ gap: 12 }}>
            {instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{i + 1}</Text>
                </View>
                <Text style={styles.bodyText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.muted, { fontStyle: "italic" }]}>
            No instructions provided.
          </Text>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
  muted: { color: TEXT_SECONDARY, fontSize: 14 },

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
});
