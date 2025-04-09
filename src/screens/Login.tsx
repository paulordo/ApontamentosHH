// Tela de Login
// Responsável por capturar o usuário e senha digitados
// realizar a autenticação via authbasic e redirecionar para a tela Home.
// Também armazena os dados de login localmente com AsyncStorage.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/authService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppRoutes';

const Login = () => {
  console.log('Tela de login carregada');
  
  // Variaveis para guardar o que o usuario digita
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Função chamada para autenticar o usuario ao apertar botão "entrar"
  const autenticar = async () => {
    try {
      // Tenta logar com os dados digitados
      await login(usuario, senha);

      // Se der certo, armazena os dados no AsyncStoragea
      await AsyncStorage.setItem('usuario', usuario);
      await AsyncStorage.setItem('senha', senha);

      // Navega para a tela Home
      navigation.navigate('Home');
    } catch (error: any) {

      // Se der erro, mostra um alerta com a mensagem de erro
      Alert.alert('Erro', error.message || 'Erro ao conectar com o servidor.');
    }
  };

  // renderiza a tela de login
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Usuário</Text>
      <TextInput style={styles.input} onChangeText={setUsuario} value={usuario} />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        onChangeText={setSenha}
        value={senha}
        secureTextEntry
      />

      <Button title="Entrar" onPress={autenticar} />
    </View>
  );
};


export default Login; // Exporta o componente Login para ser usado em outras partes

// Estilização do componente
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 10,
    borderRadius: 4,
  },
});