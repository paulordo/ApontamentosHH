import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Função chamada para autenticar o usuario ao apertar botão "entrar"
  const autenticar = async () => {
    setLoading(true);
    try {
      // Tenta logar com os dados digitados
      console.log('Autenticando...')
      await login(usuario, senha);

      // Se der certo, armazena os dados no AsyncStoragea
      console.log('Login realizado com sucesso');
      await AsyncStorage.setItem('usuario', usuario);
      await AsyncStorage.setItem('senha', senha);

      // Navega para a tela Home
      navigation.navigate('Home');
    } catch (error: any) {
      console.log('Erro ao logar:', error.message);
    } finally {
      setLoading(false);
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

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={{marginTop:20}} />
      ) : ( 
        <Button title="Entrar" onPress={autenticar} /> 
      )}
    </View>
  );
};


export default Login;

// Estilização do componente
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', minWidth: 400},
  label: { fontWeight: 'bold', fontSize: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 10,
    borderRadius: 4,
    minWidth: 300,
  },
});