import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/Authprovider";
import { generateWeeklyMenu } from "../services/recipesService";
import {
  readWeeklyMenuLocal,
  saveWeeklyMenuLocal,
  toWeeklyMenuJSON,
} from "../utils/menuStorage";
import { replaceRecipesWithAI } from "../services/aiMenuService";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { WandSparkles, Utensils, Plus } from "lucide-react-native";

type Props = NativeStackScreenProps<AppStackParamList, "Menu">;

type DisplayRecipe = {
  id: string;
  title: string;
  ingredients?: string[];
};

async function onSignOut() {
  await supabase.auth.signOut();
}

const DAY_LABELS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const ACCENT = "#FF9500";
const PRIMARY = "#007AFF";

export default function MenuScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DisplayRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const busy = loading || aiLoading;

  useEffect(() => {
    (async () => {
      try {
        const saved = await readWeeklyMenuLocal(); // aktuell vecka
        if (saved) {
          setItems(
            saved.days.map((d) => ({
              id: d.id,
              title: d.title,
              ingredients: d.ingredients ?? [],
            }))
          );
        }
      } catch (e) {}
    })();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedDays((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onGenerate = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      setLoading(true);

      const next = await generateWeeklyMenu(user.id);
      setItems(
        next.map((r) => ({
          id: r.id,
          title: r.title,
          ingredients: r.ingredients
            ? typeof r.ingredients === "string"
              ? [r.ingredients]
              : r.ingredients
            : [],
        }))
      );

      const menuJson = toWeeklyMenuJSON(
        next.map((r) => ({
          id: r.id,
          title: r.title,
          ingredients:
            typeof r.ingredients === "string"
              ? [r.ingredients]
              : r.ingredients ?? [],
          servings: 4,
        })),
        user.id
      );

      await saveWeeklyMenuLocal(menuJson);
      setItems(
        menuJson.days.map((d) => ({
          id: d.id,
          title: d.title,
          ingredients: d.ingredients ?? [],
        }))
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <View style={styles.screen}>
      {aiLoading && (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" />
            <Text style={styles.overlayTitle}>Generating with AI…</Text>
            <Text style={styles.overlaySub}>This may take a moment</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Menu</Text>
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={items.slice(0, 5)}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              Inga recept ännu – lägg till ditt första recept!
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isSelected = selectedDays.includes(item.id);
          return (
            <View style={[styles.card, isSelected && styles.cardSelected]}>
              {/* Klicka på titelområdet för att öppna detaljsidan */}
              <Pressable
                style={styles.titleArea}
                onPress={() =>
                  navigation.navigate("Recipe", {
                    id: item.id,
                    title: item.title,
                  })
                }
              >
                <Text style={styles.dayLabel}>
                  {DAY_LABELS[index] ?? `DAY ${index + 1}`}
                </Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </Pressable>
              {/* Checkbox */}
              <Pressable
                onPress={() => toggleSelect(item.id)}
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Välj ${item.title}`}
                style={[styles.checkbox, isSelected && styles.checkboxChecked]}
              >
                {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View style={{ paddingTop: 8 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      <View style={styles.actions}>
        <View style={styles.buttonGrid}>
          <Button
            variant="solid"
            action="primary"
            size="md"
            onPress={onGenerate}
            disabled={busy || !user?.id}
            style={[styles.actionPrimary, styles.pillRadius, styles.gridButton]}
          >
            <Utensils size={18} color="#ffffff" />
            {loading ? (
              <>
                <ButtonSpinner />
                <ButtonText style={{ marginLeft: 8 }}>Generating…</ButtonText>
              </>
            ) : (
              <ButtonText>Generate Menu</ButtonText>
            )}
          </Button>

          <Button
            variant="solid"
            size="md"
            onPress={async () => {
              setError(null);
              setAiLoading(true);
              try {
                const updated = await replaceRecipesWithAI(selectedDays);
                setItems(
                  updated.days.map((d: any) => ({ id: d.id, title: d.title }))
                );
                setSelectedDays([]);
              } catch (err: any) {
                console.error("AI-fel:", err);
                setError(
                  err?.message ?? "Kunde inte byta ut rätter med AI just nu."
                );
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={selectedDays.length === 0 || busy}
            style={[
              styles.actionAI,
              styles.pillRadius,
              styles.gridButton,
              (selectedDays.length === 0 || busy) && styles.disabledSoft,
            ]}
          >
            <WandSparkles size={18} color="#ffffff" />
            {aiLoading ? (
              <>
                <ButtonSpinner />
                <ButtonText style={{ marginLeft: 8 }}>Replacing…</ButtonText>
              </>
            ) : (
              <ButtonText>
                {selectedDays.length > 0
                  ? `Replace ${selectedDays.length} recipes with AI`
                  : "Replace with AI"}
              </ButtonText>
            )}
          </Button>
        </View>
        <View style={styles.linkButtonRow}>
          <Button
            variant="link"
            size="md"
            action="primary"
            onPress={() =>
              navigation.push("ShoppingList", {
                selectedIds: selectedDays.length ? selectedDays : undefined,
              })
            }
            disabled={busy}
          >
            <View style={styles.underlinedText}>
              <ButtonText>Create Shopping List</ButtonText>
            </View>
          </Button>
          <Button
            variant="link"
            size="md"
            action="primary"
            onPress={() => navigation.push("RecipeCollection")}
          >
            <View style={styles.underlinedText}>
              <ButtonText>My Recipes</ButtonText>
            </View>
          </Button>
          <Button
            variant="link"
            size="md"
            action="negative"
            onPress={onSignOut}
            style={styles.signOutBtn}
          >
            <View style={styles.underlinedText}>
              <ButtonText style={{ color: "#DC3D3D" }}>Sign Out</ButtonText>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1D1D1F" },
  pillButton: {
    height: 48,
    width: 48,
    borderRadius: 100,
  },

  listContent: { padding: 16, paddingBottom: 8, gap: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F1F4",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  cardSelected: { borderColor: "#1F7BFF55", backgroundColor: "#F5F9FF" },
  dayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1D1D1F" },
  dot: { width: 8, height: 8, borderRadius: 4 },

  actions: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridButton: {
    flex: 1,
    minWidth: "45%",
    justifyContent: "center",
    alignItems: "center",
  },

  linkButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
  },
  underlinedText: {
    borderBottomWidth: 1,
    borderBottomColor: "currentColor",
  },
  pillRadius: { borderRadius: 18, height: 56 },
  actionPrimary: { backgroundColor: PRIMARY },
  actionAI: { backgroundColor: ACCENT },
  actionSecondary: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  disabledSoft: { opacity: 0.6 },

  buttonTextStyle: { fontSize: 16 },

  signOutBtn: {
    height: 28,
    borderRadius: 14,
  },

  emptyText: { color: "#666", textAlign: "center", marginTop: 8 },
  errorText: {
    color: "#c00",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  overlayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    maxWidth: 320,
  },
  overlayTitle: { color: "#111", marginTop: 10, fontWeight: "700" },
  overlaySub: { color: "#666", marginTop: 4, fontSize: 12 },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    borderColor: "#007AFF",
    backgroundColor: "#E6F0FF",
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    lineHeight: 16,
  },
  titleArea: {
    flex: 1,
    paddingRight: 16,
  },
});
