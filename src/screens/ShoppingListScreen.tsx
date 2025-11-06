import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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

type Props = NativeStackScreenProps<AppStackParamList, "ShoppingList">;

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
    navigation.setOptions({ title: "Inköpslista" });
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
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Laddar inköpslista…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Hittade inga ingredienser i veckomenyn.
        </Text>
        <Text style={{ marginTop: 8, color: "#666" }}>
          Generera först en veckomeny och försök igen.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ marginTop: 12 }}
        data={items}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggle(item.id)}
            activeOpacity={0.7}
            style={styles.row}
          >
            <View
              style={[styles.checkbox, item.checked && styles.checkboxChecked]}
            >
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[styles.rowLabel, item.checked && styles.rowLabelChecked]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6aa0ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#6aa0ff",
  },
  checkmark: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 14,
  },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowLabelChecked: { textDecorationLine: "line-through", color: "#8aa" },
});
