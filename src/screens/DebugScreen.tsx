import { useEffect } from "react";
import { testRead, testWrite } from "../lib/testSupabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Debug">;

export default function DebugScreen() {
  useEffect(() => {
    (async () => {
      try {
        await testRead();
        await testWrite();
      } catch (e) {
        console.error("Supabase test error:", e);
      }
    })();
  }, []);
  return null;
}
