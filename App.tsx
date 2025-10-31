// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import MenuScreen from "./src/screens/MenuScreen";
import RecipeScreen from "./src/screens/RecipesScreen";
import DebugScreen from "./src/screens/DebugScreen";
import ExampleScreen from "./src/screens/ExampleScreen";
import AccountScreen from "./src/screens/AccountScreen";
import { AuthProvider, useAuth } from "./src/lib/Authprovider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

AuthProvider;

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Example: undefined;
  Debug: undefined;
  Menu: undefined;
  Recipe: { title?: string } | undefined;
  Account: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <GluestackUIProvider mode="dark">
      <AuthStack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    </GluestackUIProvider>
  );
}

function MainAppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <AppStack.Screen name="Menu" component={MenuScreen} />
      <AppStack.Screen name="Example" component={ExampleScreen} />
      <AppStack.Screen name="Debug" component={DebugScreen} />
      <AppStack.Screen name="Recipe" component={RecipeScreen} />
      <AppStack.Screen name="Account" component={AccountScreen} />
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
