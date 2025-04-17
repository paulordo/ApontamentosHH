import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Define a interface para representar pessoa da equipe
interface Pessoa {
  PEQ_CODIGO: number; // Codigo do funcionário
  PES_RAZAO: string;  // Nome do funcionário
}

// Define as propriedades esperadas pelo componente
interface Props {
  nomeEquipe: string;      // Nome da equipe
  pessoas: Pessoa[];       // Lista de funcionários
  carregando: boolean;     // Indica se os dados ainda estão sendo carregados

  funcionarioSelecionado: number | null;
  onSelecionarFuncionario: (idFuncionario: number) => void;

  onAbrirApontamentos: (idFuncionario: number, nomeFuncionario: string) => void;
}

// Componente funcional que exibe os funcionários de uma equipe
const CardFuncionario: React.FC<Props> = ({ nomeEquipe, pessoas, carregando, funcionarioSelecionado, onSelecionarFuncionario, onAbrirApontamentos }) => {

  // Se estiver carregando, mostra um loading
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando equipe...</Text>
      </View>
    );
  }

  // Exibe a lista de funcionários, ou uma mensagem se não houver dados
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Funcionários {nomeEquipe}</Text>

      {pessoas.length > 0 ? (
        // Renderiza cada funcionário dentro de um card
        pessoas.map((pessoa) => (
        <View
          key={pessoa.PEQ_CODIGO}
          style={[
            styles.card,
            funcionarioSelecionado === pessoa.PEQ_CODIGO && styles.cardSelecionado
          ]}
        >
          <TouchableOpacity onPress={() => onSelecionarFuncionario(pessoa.PEQ_CODIGO)} style={styles.cardHeader}>
            <Text style={styles.texto}>{pessoa.PES_RAZAO}</Text>
            <TouchableOpacity onPress={() => onAbrirApontamentos(pessoa.PEQ_CODIGO, pessoa.PES_RAZAO)}>
              <Icon name="eye" size={22} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        ))
      ) : (
        // Caso a lista esteja vazia
        <Text style={styles.semDados}>Nenhum funcionário encontrado.</Text>
      )}
    </ScrollView>
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
    alignSelf: 'flex-start',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    marginBottom: 10,
    textTransform: 'capitalize',
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
    color: '#fff',
    fontSize: 18,
  },
  semDados: {
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
  cardSelecionado: {
    backgroundColor: '#4caf50',
    borderColor: '#2e7d32',
  },
  cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

});

// Exporta para ser utilizado em outros arquivos
export default CardFuncionario;
