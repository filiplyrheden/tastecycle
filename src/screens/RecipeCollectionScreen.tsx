import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { listMyRecipes } from "../lib/recipes";
import { Button, ButtonText } from "@/components/ui/button";
import { Plus } from "lucide-react-native";

type Props = NativeStackScreenProps<AppStackParamList, "RecipeCollection">;

type Recipe = {
  id: string;
  title: string;
  ingredients?: string[] | string | null;
  instructions?: string | string[] | null;
  created_at?: string;
};

const BG = "#F2F2F7";
const SURFACE = "#FFFFFF";

export default function RecipeCollectionScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await listMyRecipes();
    setRecipes((data as Recipe[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("Recipe", { id: item.id, title: item.title })
      }
      style={({ pressed }) => [
        styles.cardRow,
        pressed && { opacity: 0.9, transform: [{ scale: 0.997 }] },
      ]}
    >
      <Text style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.headerTitle}>My Recipes</Text>
        </View>
        <Button
          variant="solid"
          size="xs"
          action="positive"
          onPress={() => navigation.push("AddNewRecipe")}
          style={[
            styles.pillButton,
            { paddingHorizontal: 0, paddingVertical: 0 },
          ]}
        >
          <Plus size={24} color="#ffffff" strokeWidth={2.5} />
        </Button>
      </View>

      {loading ? (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : null}

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
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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
  headerTitle: { fontSize: 32, fontWeight: "800", color: "#1D1D1F" },

  pillButton: {
    height: 48,
    width: 48,
    borderRadius: 100,
  },

  cardRow: {
    backgroundColor: "#FAFAFB",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "#E4E5E8",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1D1D1F",
    lineHeight: 22,
  },

  pill: { borderRadius: 16, height: 48 },

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
});
