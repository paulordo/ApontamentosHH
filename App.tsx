import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper'; // ✅ Importa o provider do Paper
import { RootStackParamList } from './src/navigation/types';
import Login from './src/screens/Login';
import Home from './src/screens/Home';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ title: 'Home' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
