import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import MenuScreen from "./src/screens/MenuScreen";
import RecipeScreen from "./src/screens/RecipesScreen";
import DebugScreen from "./src/screens/DebugScreen";
import ExampleScreen from "./src/screens/ExampleScreen";

export type RootStackParamList = {
  Login: undefined;
  Menu: undefined;
  Recipe: { title: string } | undefined;
  Debug: undefined;
  Example: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="Example" component={ExampleScreen} />
        <Stack.Screen name="Debug" component={DebugScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Recipe" component={RecipeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
