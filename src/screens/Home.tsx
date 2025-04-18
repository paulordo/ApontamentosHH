import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import axios from 'axios';
import { encode as btoa } from 'base-64';
import { getApi } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator, Text, TextInput, Modal, Portal, Button } from 'react-native-paper';
import CardFuncionario from '../components/CardFuncionario';
import { CardOrdens } from '../components/CardOrdens';
import FormularioApontamento from '../components/FormularioApontamento';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Apontamento } from '../components/FormularioApontamento';
import type { Ordem } from '../components/CardOrdens';
 
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
  const [horaFimEditando, setHoraFimEditando] = useState<string | null>(null);
  const [apontamentoSendoEditado, setApontamentoSendoEditado] = useState<Apontamento | null>(null);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
  
  
  // Carrega as equipes com retry até sucesso
  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    const carregarEquipes = async () => {
      try {
        setCarregandoEquipes(true);
        const api = await getApi();
        console.log(`[EQUIPES] URL completa: /api/v1/pcm/equipemanutencao/0/0/0/0`)
        const response = await api.get(`/api/v1/pcm/equipemanutencao/0/0/0/0`);

        setEquipes(response.data);
        setCarregandoEquipes(false);
        clearInterval(intervalo);
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
    const carregarOrdens = async () => {
      try {
        setCarregandoOrdens(true);
        const api = await getApi();
        const whereBase64 = btoa('ODP_STATUS;IN;A,P,E');
        console.log(`[ORDENS] URL completa: /api/v1/pcp/ordensproducao/${whereBase64}/0/3/0`);
        const response = await api.get(`/api/v1/pcp/ordensproducao/${whereBase64}/0/3/0`);
  
        if (Array.isArray(response.data) && response.data.length > 0) {
          setOrdens(response.data);
          console.log('Dados recebidos Ordens:', response.data);
  
          // Interrompe o intervalo assim que os dados forem recebidos
          if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
            intervaloRef.current = null;
          }
        } else {
          console.log('Nenhuma ordem encontrada.');
        }
      } catch (erro) {
        console.log('Erro ao carregar ordens');
        if (axios.isAxiosError(erro)) {
          console.log('Erro Axios:', erro.response?.data || erro.message);
        } else if (erro instanceof Error) {
          console.log('Mensagem:', erro.message);
        } else {
          console.log('Erro desconhecido:', JSON.stringify(erro));
        }
      } finally {
        setCarregandoOrdens(false);
      }
    };
  
    // Chamada inicial
    carregarOrdens();
  
    // Armazena o intervalo na ref
    intervaloRef.current = setInterval(carregarOrdens, 5000);
  
    // Limpa no unmount do componente
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
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
    setOrdemSelecionada(ordem.ODP_HIERARQUIA);
    console.log('Ordem selecionada:', ordem.ODP_HIERARQUIA);
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

  const handleExcluirApontamento = async (apontamento: Apontamento) => {
    try {
      const dados = await AsyncStorage.getItem('apontamentos');
      const todosApontamentos = dados ? JSON.parse(dados) : [];
      
      const atualizados = todosApontamentos.filter((a: Apontamento) =>
        !(
          a.funcionarioId === apontamento.funcionarioId &&
          a.ordemId === apontamento.ordemId &&
          a.data === apontamento.data &&
          a.horaInicio === apontamento.horaInicio &&
          a.horaFim === apontamento.horaFim
        )
      );
  
      await AsyncStorage.setItem('apontamentos', JSON.stringify(atualizados));
  
      const atualizadosFuncionario = atualizados.filter(
        (a: any) => a.funcionarioId === apontamento.funcionarioId
      );
      
      setApontamentosFuncionario(atualizadosFuncionario);
  
      console.log('Apontamento excluído com sucesso:', apontamento);
    } catch (error) {
      console.error('Erro ao excluir apontamento:', error);
    }
  };

  return (
    <View style={styles.container}>
      {carregandoEquipes ? (
        <View style={{ alignItems: 'center' }}>
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
                    } } data={''} horaInicio={''} horaFim={''}                
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
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
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
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {/* Coluna da esquerda */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1}}>OS: {ap.ordemId}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1}}>Data: {ap.data}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1}}>Início: {ap.horaInicio}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1}}>Fim: {ap.horaFim}</Text>

              {apontamentoSendoEditado?.ordemId === ap.ordemId &&
              apontamentoSendoEditado?.funcionarioId === ap.funcionarioId && (
                <View>
                  <TextInput
                    label="Editar Hora Fim"
                    value={horaFimEditando ?? undefined}
                    onChangeText={(text) => {
                      let onlyDigits = text.replace(/\D/g, "").slice(0, 4);
                      if (onlyDigits.length >= 3) {
                        onlyDigits = onlyDigits.replace(/(\d{2})(\d{1,2})/, "$1:$2");
                      }
                      setHoraFimEditando(onlyDigits);
                    }}
                    keyboardType="numeric"
                    style={{ backgroundColor: "white", maxHeight: 50}}
                    maxLength={5}
                    placeholder="00:00"
                    mode="outlined"
                  />

                  <Button
                    labelStyle={{ color: 'black' }}
                    mode="contained"
                    onPress={() => {
                      if (!horaFimEditando || horaFimEditando.trim() === "") {
                        console.error("Hora inválida");
                        return;
                      }

                      const apontamentoAtualizado = apontamentosFuncionario.map((a) =>
                        a.ordemId === ap.ordemId && a.funcionarioId === ap.funcionarioId
                          ? { ...a, horaFim: horaFimEditando }
                          : a
                      );

                      setApontamentosFuncionario(apontamentoAtualizado);
                      AsyncStorage.setItem("apontamentos", JSON.stringify(apontamentoAtualizado));
                      setHoraFimEditando(null);
                      setApontamentoSendoEditado(null);
                    }}
                    style={{ marginTop: 10, maxWidth: 150, maxHeight: 50, backgroundColor: 'yellow' }}
                  >
                    Pausar Hora
                  </Button>
                </View>
              )}
            </View>

            {/* Coluna da direita (botões) */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setApontamentoSendoEditado(ap);
                  setHoraFimEditando(ap.horaFim);
                }}
                style={{ marginBottom: 10, width: 100, backgroundColor: 'yellow' }}
                labelStyle={{ color: 'black' }}
              >
                Pausar
              </Button>

              <Button
                mode="outlined"
                onPress={() => handleExcluirApontamento(ap)}
                style={{ width: 100, backgroundColor: 'red' }}
                labelStyle={{ color: 'black' }}
              >
                Excluir
              </Button>
            </View>
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

// Estilizaçõ
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
