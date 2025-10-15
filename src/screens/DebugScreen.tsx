import { useEffect } from "react";
import { testRead, testWrite } from "../lib/testSupabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../App";

type Props = NativeStackScreenProps<AppStackParamList, "Debug">;

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
