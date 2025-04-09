// Configurações de rotas da aplicação
// Define a navegação principal entre as telas do app utilizando o react navigation.
// Inclui as rotas para Login e Home, alem de tipar as rotas com RootStackParamList.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Home from '../screens/Home';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

// Cria uma instância do Stack Navigator com as rotas definidas
const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente principal de rotas do aplicativo
export default function AppRoutes() {
  return (
    // Define a transição entre rotas do aplicativo
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}