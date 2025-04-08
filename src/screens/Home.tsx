
// Tela Home
// Tela acessada após o login. Usa a instância da API autenticada via getApi()
// para buscar dados protegidos do servidor e exibir ao usuário.

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { getApi } from '../services/api';

const Home = () => {
  // Variável para armazenar os dados recebidos da api
  const [dados, setDados] = useState<any>(null);

  // Função para carregar os dados da api quando o componente é carregado
  useEffect(() => {
    console.log('Tela Home carregada');
    // Função que busca os dados para a api
    const carregarDados = async () => {
      try {
        console.log('Carregando dados...');
        
        const api = await getApi(); // Pega a instância da API já com autenticação
        const response = await api.get('/api/v1/pcm/equipemanutencao/9'); // Faz a requisição para a API

        setDados(response.data); // Armazena os dados recebidos no estado
        console.log('Dados recebidos:', response.data); // Loga os dados recebidos
        
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados');
        console.log('Erro ao carregar dados:', error); // Loga o erro
      }
    };


    carregarDados();
  }, []); // [] significa que o efeito só roda uma vez quando o componente é carregado

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tela Home - Equipe de Manutenção</Text>
      {dados ? (
        <Text style={styles.text}>{JSON.stringify(dados, null, 2)}</Text>
      ) : (
        <Text>Carregando dados...</Text>
      )}
    </ScrollView>
  );
};
export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
