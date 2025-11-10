import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";
import {
  buildShoppingList,
  setItemChecked,
  setAllChecked,
  clearChecked,
  ShoppingItem,
} from "../utils/shoppingList";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

type Props = NativeStackScreenProps<AppStackParamList, "ShoppingList">;

const SURFACE = "#FFFFFF";
const BG = "#F2F2F7";
const PRIMARY = "#007AFF";
const TEXT_PRIMARY = "#1D1D1F";
const TEXT_SECONDARY = "#8E8E93";

export default function ShoppingListScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [bulkWorking, setBulkWorking] = useState(false);

  const selectedIds: string[] | undefined = route.params?.selectedIds;

  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => i.checked),
    [items]
  );
  const anyChecked = useMemo(() => items.some((i) => i.checked), [items]);

  const load = async () => {
    setLoading(true);
    try {
      const list = await buildShoppingList(selectedIds);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: "Shopping List" });
    load();
  }, []);

  const toggle = async (id: string) => {
    const next = items.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i
    );
    setItems(next);
    const current = next.find((i) => i.id === id);
    await setItemChecked(id, !!current?.checked);
  };

  const toggleAll = async () => {
    setBulkWorking(true);
    try {
      const target = !allChecked;
      const next = items.map((i) => ({ ...i, checked: target }));
      setItems(next);
      await setAllChecked(allIds, target);
    } finally {
      setBulkWorking(false);
    }
  };

  const clear = async () => {
    setBulkWorking(true);
    try {
      await clearChecked();
      await load();
    } finally {
      setBulkWorking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={[styles.muted, { marginTop: 8 }]}>
          Loading shopping list…
        </Text>
        <Text style={[styles.muted, { fontSize: 12 }]}>
          Please wait a moment
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centerFull}>
        <View style={styles.emptyCircle} />
        <Text style={styles.title}>No Ingredients Found</Text>
        <Text
          style={[
            styles.muted,
            { textAlign: "center", marginHorizontal: 24, marginTop: 6 },
          ]}
        >
          Generate a weekly menu first to automatically create your shopping
          list.
        </Text>
        <Button
          variant="solid"
          action="primary"
          size="md"
          onPress={() => navigation.push("Menu")}
          style={[styles.pill, { marginTop: 14, backgroundColor: PRIMARY }]}
        >
          <ButtonText>Generate Weekly Menu</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: TEXT_PRIMARY, fontSize: 16 }}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <View style={{ width: 40, height: 40 }} />
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        data={items}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggle(item.id)}
            style={({ pressed }) => [
              styles.row,
              pressed && { backgroundColor: "#F8FAFF" },
            ]}
          >
            <Text
              style={[styles.rowLabel, item.checked && styles.rowLabelChecked]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Button
            variant="solid"
            size="md"
            action="primary"
            onPress={toggleAll}
            disabled={bulkWorking || items.length === 0}
            style={[styles.pill, styles.primaryBtn]}
          >
            {bulkWorking ? (
              <>
                <ButtonSpinner />
                <ButtonText style={{ marginLeft: 8 }}>Working…</ButtonText>
              </>
            ) : (
              <ButtonText>
                {allChecked ? "Uncheck All" : "Mark all as checked"}
              </ButtonText>
            )}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE },
  header: {
    backgroundColor: SURFACE,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F2",
    flexDirection: "row",
    alignItems: "center",
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF0F2",
    backgroundColor: "#FFFFFF",
  },
  rowLabel: { fontSize: 16, fontWeight: "600", color: TEXT_PRIMARY, flex: 1 },
  rowLabelChecked: {
    textDecorationLine: "line-through",
    color: TEXT_SECONDARY,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: "#EDEDED",
  },
  footerRow: { flexDirection: "row", gap: 10 },
  pill: { borderRadius: 18, height: 52, flex: 1 },
  primaryBtn: { backgroundColor: PRIMARY },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },

  centerFull: {
    flex: 1,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: "800", color: TEXT_PRIMARY, marginTop: 6 },
  muted: { color: TEXT_SECONDARY, fontSize: 14 },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BG,
  },
});
