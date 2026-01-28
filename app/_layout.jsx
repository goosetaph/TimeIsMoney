import { Stack, Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FontAwesome6  } from "@expo/vector-icons";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'dodgerblue', headerShown: false}}>
        <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color }) => <FontAwesome6 name= 'cart-shopping' size={24} color={color}/>}}/>
        <Tabs.Screen name="index" options={{ title: 'Timer', tabBarIcon: ({ color }) => <FontAwesome6 name= 'stopwatch' size={24} color={color}/>}}/>
        <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <FontAwesome6 name= 'clock-rotate-left' size={24} color={color}/>}}/>
      </Tabs>
    </CurrencyProvider>

  );
}
