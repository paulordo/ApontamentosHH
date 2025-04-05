import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/types";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import MD5 from "crypto-js/md5";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Função para fazer o login
const handleLogin = async () => {
    const hashedPassword = MD5(password).toString(); // senha em MD5
    const credentials = `${username}:${hashedPassword}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
  
    try {
      const response = await axios.get('http://192.168.0.240:8087/api/v1/mobile/usuarios', {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      });
  
      if (response.data?.success) {
        Alert.alert('Sucesso', 'Login realizado com sucesso');
        // Navegar para a tela Home após o login bem-sucedido
        navigation.navigate('Home');
        return;
      } else {
        Alert.alert('Erro', 'Usuário ou senha inválidos');
      }
    } 
    catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível conectar à API');
      console.log(error);
    }
  };
  
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Usuário"
          style={styles.input}
          onChangeText={setUsername}
          value={username}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />
        <Button title="Entrar" onPress={handleLogin} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    input: {
      borderBottomWidth: 1,
      marginBottom: 16,
      padding: 8,
    },
  });

  export default Login;