import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import MenuScreen from "./src/screens/MenuScreen";
import RecipeScreen from "./src/screens/RecipeScreen";
import { AuthProvider, useAuth } from "./src/lib/Authprovider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import RecipeCollectionScreen from "./src/screens/RecipeCollectionScreen";
import AddNewRecipeScreen from "./src/screens/AddNewRecipeScreen";
import ShoppingListScreen from "./src/screens/ShoppingListScreen";

AuthProvider;

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Debug: undefined;
  Menu: undefined;
  AddNewRecipe: undefined;
  RecipeCollection: { title?: string } | undefined;
  Recipe: { id: string; title?: string };
  ShoppingList: { selectedIds?: string[] } | undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <GluestackUIProvider mode="dark">
      <AuthStack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "" }}
        />
      </AuthStack.Navigator>
    </GluestackUIProvider>
  );
}

function MainAppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <AppStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: "" }}
      />
      <AppStack.Screen
        name="AddNewRecipe"
        component={AddNewRecipeScreen}
        options={{ title: "" }}
      />
      <AppStack.Screen
        name="RecipeCollection"
        component={RecipeCollectionScreen}
        options={{ title: "" }}
      />
      <AppStack.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{ title: "" }}
      />
      <AppStack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{ title: "" }}
      />
    </AppStack.Navigator>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  if (loading) return null;

  return session ? <MainAppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <GluestackUIProvider>
          <RootNavigator />
        </GluestackUIProvider>
      </NavigationContainer>
    </AuthProvider>
  );
}
