import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Define a estrutura dos dados de uma ordem de produção
interface Ordem {
  ODP_NRPREORDEM: string; // Número da pré-ordem
}

// Define as propriedades esperadas pelo componente
interface CardOrdensProps {
  ordens: Ordem[];       // Lista de ordens de produção
  carregando: boolean;   // Indica se os dados ainda estão sendo carregados
}

// Componente funcional que exibe um card com a lista de ordens
const CardOrdens: React.FC<CardOrdensProps> = ({ ordens, carregando }) => {

  // Se estiver carregando, exibe o loading e mensagem
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando ordens...</Text>
      </View>
    );
  }

  // Se não estiver carregando, exibe as ordens ou mensagem de vazio
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ordens</Text>

      {ordens.length > 0 ? (
        // renderiza cada ordem e exibe dentro de um card
        ordens.map((ordem, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.texto}>OS: {ordem.ODP_NRPREORDEM}</Text>
          </View>
        ))
      ) : (
        // Caso a lista esteja vazia
        <Text style={styles.semOrdens}>Nenhuma ordem disponível.</Text>
      )}
    </View>
  );
};

// Estilização
const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    maxWidth: 450,
    minWidth: 400,
    maxHeight: 600,
    alignSelf: 'flex-end'
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  card: {
    backgroundColor: '#999',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  texto: {
    fontSize: 20,
    color: '#fff',
  },
  semOrdens: {
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
});

// exporta para ser usado em outros arquivos
export default CardOrdens;
