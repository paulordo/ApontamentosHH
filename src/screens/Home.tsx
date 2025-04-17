import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import axios from 'axios';
import { encode as btoa } from 'base-64';
import { getApi } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator, Text, Modal, Portal } from 'react-native-paper';
import CardFuncionario from '../components/CardFuncionario';
import { CardOrdens } from '../components/CardOrdens';
import FormularioApontamento from '../components/FormularioApontamento';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos para equipes, pessoas e ordens
interface Equipe {
  EQM_CODIGO: number;
  EQM_DESCRICAO: string;
  PESSOAS: Pessoa[];
}

interface Pessoa {
  PEQ_CODIGO: number;
  PES_RAZAO: string;
  PEQ_EQUIPE: number;
}

interface Ordem {
  ODP_NRPREORDEM: string;
  ODP_PRODUTO: string;
}

export default function Home() {
  // Estados principais
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<number | null>(null);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState<number | null>(null);
  const [carregandoEquipes, setCarregandoEquipes] = useState(true);
  const [carregandoOrdens, setCarregandoOrdens] = useState(true);
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [apontamentosFuncionario, setApontamentosFuncionario] = useState<any[]>([]);
  const [nomeFuncionarioSelecionado, setNomeFuncionarioSelecionado] = useState('');

  
  // Carrega as equipes com retry até sucesso
  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    const carregarEquipes = async () => {
      try {
        setCarregandoEquipes(true);
        const api = await getApi();
        const response = await api.get(`/api/v1/pcm/equipemanutencao/0/0/0/0`);

        setEquipes(response.data);
        setCarregandoEquipes(false);
        clearInterval(intervalo); // Para o retry após sucesso
        console.log('Dados recebidos Equipes:', response.data)
      } catch (erro) {
        console.log('Erro ao carregar equipes. Tentando novamente...');
        if (axios.isAxiosError(erro)) {
          console.log("Erro Axios:", erro.response?.data);
        } else {
          console.log("Erro desconhecido:", erro);
        }
      }
    };

    carregarEquipes();
    intervalo = setInterval(carregarEquipes, 3000);
    return () => clearInterval(intervalo);
  }, []);

  // Carrega as ordens com retry até sucesso
  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    const carregarOrdens = async () => {
      try {
        setCarregandoOrdens(true);
        const api = await getApi();
        const whereBase64 = btoa('ODP_STATUS;IN;A,P,E');
        const response = await api.get(`/api/v1/pcp/ordensproducao/${whereBase64}/0/1/0`);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setOrdens(response.data);
          setCarregandoOrdens(false);
          clearInterval(intervalo); // Para o retry após sucesso
          console.log('Dados recebidos Ordens:', response.data)
        } else {
          console.log('Nenhuma ordem encontrada.');
        }
      } catch (erro) {
        console.log('Erro ao carregar ordens');
        if (erro instanceof Error) {
          console.log('Mensagem:', erro.message);
        } else if (axios.isAxiosError(erro)) {
          console.log('Erro Axios:', erro.response?.data || erro.message);
        } else {
          console.log('Erro desconhecido:', JSON.stringify(erro));
        }
      }
    };

    carregarOrdens();
    intervalo = setInterval(carregarOrdens, 3000);
    return () => clearInterval(intervalo);
  }, []);

  // Recupera os dados da equipe selecionada
  const equipe = equipes.find(e => e.EQM_CODIGO === equipeSelecionada);

  // Callback para selecionar funcionário
  const onSelecionarFuncionario = (idFuncionario: number) => {
    setFuncionarioSelecionado(idFuncionario);
  
    const funcionario = equipe?.PESSOAS.find(p => p.PEQ_CODIGO === idFuncionario);
    const nome = funcionario?.PES_RAZAO ?? 'Desconhecido';
  
    console.log(`Funcionário selecionado: ${idFuncionario} - ${nome}`);
  };
  

  // Callback para selecionar ordem
  const onSelectOrdem = (ordem: Ordem) => {
    setOrdemSelecionada(ordem.ODP_NRPREORDEM);
    console.log('Ordem selecionada:', ordem.ODP_NRPREORDEM);
  };

  const abrirApontamentos = async (idFuncionario: number, nomeFuncionario: string) => {
    try {
      const dados = await AsyncStorage.getItem('apontamentos');
      const todosApontamentos = dados ? JSON.parse(dados) : [];
  
      const filtrados = todosApontamentos.filter(
        (a: any) => a.funcionarioId === idFuncionario
      );
  
      setApontamentosFuncionario(filtrados);
      setNomeFuncionarioSelecionado(nomeFuncionario);
      setModalVisivel(true);
    } catch (error) {
      console.error('Erro ao buscar apontamentos:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      {carregandoEquipes ? (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <>
          {/* Seletor de Equipes */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={equipeSelecionada}
              onValueChange={(itemValue) => {
                console.log('Equipe selecionada:', itemValue);
                setEquipeSelecionada(itemValue);
              }}
              style={styles.picker}
              dropdownIconColor="#555"
            >
              <Picker.Item label="Selecione uma equipe" value={null} />
              {equipes.map((equipe) => (
                <Picker.Item
                  key={equipe.EQM_CODIGO}
                  label={equipe.EQM_DESCRICAO}
                  value={equipe.EQM_CODIGO}
                />
              ))}
            </Picker>
          </View>

          {/* Layout Principal */}
          <View style={styles.containerForm}>
            {/* Lista de Funcionários */}
            <View style={styles.cardFuncionarioContainer}>
              {equipe && (
                <CardFuncionario
                  nomeEquipe={equipe.EQM_DESCRICAO}
                  pessoas={equipe.PESSOAS}
                  carregando={carregandoEquipes}
                  funcionarioSelecionado={funcionarioSelecionado}
                  onSelecionarFuncionario={onSelecionarFuncionario}
                  onAbrirApontamentos={abrirApontamentos}
                />
              )}
            </View>

            {/* Formulário de Apontamento */}
            {funcionarioSelecionado && ordemSelecionada ? (
              <View style={styles.formularioContainer}>
                <FormularioApontamento
                  funcionarioId={funcionarioSelecionado}
                  ordemId={ordemSelecionada}
                  funcionarioNome={equipe?.PESSOAS.find(p => p.PEQ_CODIGO === funcionarioSelecionado)?.PES_RAZAO ?? ''}
                  onApontamentoRegistrado={() => {
                    setFuncionarioSelecionado(null);
                    setOrdemSelecionada(null);
                  }}
                />
              </View>
            ) : (
              <View style={[styles.formularioContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>Selecione um funcionário e uma ordem</Text>
              </View>
            )}

            {/* Lista de Ordens */}
            <View style={styles.cardOrdensContainer}>
              <CardOrdens
                ordens={ordens}
                carregando={carregandoOrdens}
                ordemSelecionada={ordemSelecionada}
                onSelectOrdem={onSelectOrdem}
              />
            </View>
          </View>
        </>
      )}
      <Portal>
        <Modal
          visible={modalVisivel}
          onDismiss={() => setModalVisivel(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Apontamentos de {nomeFuncionarioSelecionado}
          </Text>

          {apontamentosFuncionario.length > 0 ? (
            apontamentosFuncionario.map((ap, index) => (
              <View
                key={index}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Text>Ordem: {ap.ordemId}</Text>
                <Text>Data: {ap.data}</Text>
                <Text>Início: {ap.horaInicio}</Text>
                <Text>Fim: {ap.horaFim}</Text>
              </View>
            ))
          ) : (
            <Text>Nenhum apontamento encontrado.</Text>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

// Estilos organizados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pickerWrapper: {
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  containerForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  cardFuncionarioContainer: {
    width: 280,
  },
  formularioContainer: {
    flexGrow: 0,
    width: 360,
    padding: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    justifyContent: 'flex-start',
  },
  cardOrdensContainer: {
    width: 280,
  },
});
