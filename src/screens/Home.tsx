
// Tela Home
// Tela acessada após o login. Usa a instância da API autenticada via getApi()
// para buscar dados protegidos do servidor e exibir ao usuário.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getApi } from '../services/api';

const Home = () => {
  // Variável para armazenar os dados recebidos da api
  const [dados, setDados] = useState<any>(null);

  // Função para carregar os dados da api quando o componente é montado
  useEffect(() => {
    // Função que busca os dados para a api
    const carregarDados = async () => {
      try {
        const api = await getApi(); // Pega a instância da API já com autenticação
        const response = await api.get('/api/v1/usuario/usuario'); // Faz a requisição GET
        setDados(response.data); // Armazena os dados recebidos no estado
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados');
      }
    };

    carregarDados();
  }, []); // Os colchetes vazios indicam que a função só roda uma vez (ao abrir a tela)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Home</Text>
      <Text>{JSON.stringify(dados, null, 2)}</Text>

    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
