import React, { use, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { getApi } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { Card } from 'react-native-paper';
import CardFuncionario from '../components/CardFuncionario';

interface Equipe {
  // Define a estrutura dos dados de uma equipe
  EQM_CODIGO: number;
  EQM_DESCRICAO: string;
  PESSOAS: Pessoa[];
}

interface Pessoa {
  // Define a estrutura dos dados de uma pessoa
  PEQ_CODIGO: number;
  PES_RAZAO: string;
  PEQ_EQUIPE: number;
}

export default function Home() {
  // definição de estados para as equipes e equipe selecionada
  const [equipes, setEquipes] = useState<Equipe[]>([]); 
  const [equipeSelecionada, setEquipeSelecionada] = useState<number | null>(null);

  useEffect(() => {
    // Função para carregar os dados das equipes
    const carregarDados = async () => {
      try {
        console.log('Carregando dados...');
        const api = await getApi();
        const response = await api.get('/api/v1/pcm/equipemanutencao/0/0/0/0');
        setEquipes(response.data);
        console.log('Dados recebidos:', response.data);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados');
        console.log('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  const equipe = equipes.find(e => e.EQM_CODIGO === equipeSelecionada);
  // Verifica se a equipe selecionada existe na lista de equipes

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={equipeSelecionada}
            onValueChange={(itemValue) => setEquipeSelecionada(itemValue)}
            style={styles.picker}
            dropdownIconColor="#555"
          >
            <Picker.Item label="Equipes" value={null} />
            {equipes.map((equipe) => (
              <Picker.Item
                key={equipe.EQM_CODIGO}
                label={equipe.EQM_DESCRICAO}
                value={equipe.EQM_CODIGO}
              />
            ))}
          </Picker>
        </View>
          <Card.Content>
          {equipe && (
            <CardFuncionario
              nomeEquipe={equipe.EQM_DESCRICAO}
              pessoas={equipe.PESSOAS}
            />
          )}
          </Card.Content>
      </View>
    </ScrollView>
    );
  }


const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'space-between',
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#333',
  },
  pickerWrapper: {
    width: 160,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    color: '#333',
  },
});