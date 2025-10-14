import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./src/screens/LoginScreen";
import MenuScreen from "./src/screens/MenuScreen";
import RecipesScreen from "./src/screens/RecipesScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Tab.Screen name="Login" component={LoginScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} />
        <Tab.Screen name="Recipes" component={RecipesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
