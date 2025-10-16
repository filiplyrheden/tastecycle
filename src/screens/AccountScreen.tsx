import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";

type Props = NativeStackScreenProps<AppStackParamList, "Account">;

export default function AccountScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
});
