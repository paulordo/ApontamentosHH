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
 
// Types para equipes e pessoas
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
// Estados de seleção
const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<number | null>(null);
const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
const [equipeSelecionada, setEquipeSelecionada] = useState<number | null>(null);
// Dados carregados
const [equipes, setEquipes] = useState<Equipe[]>([]);
const [ordens, setOrdens] = useState<Ordem[]>([]);
// Estados de carregamento
const [carregandoEquipes, setCarregandoEquipes] = useState(true);
const [carregandoOrdens, setCarregandoOrdens] = useState(true);
// Modal dos apontamentos
const [modalVisivel, setModalVisivel] = useState(false);
const [apontamentosFuncionario, setApontamentosFuncionario] = useState<Apontamento[]>([]);
const [nomeFuncionarioSelecionado, setNomeFuncionarioSelecionado] = useState('');
// Edição dos apontamentos
const [horaFimEditando, setHoraFimEditando] = useState<string | null>(null);
const [apontamentoSendoEditado, setApontamentoSendoEditado] = useState<Apontamento | null>(null);
// Intervalo para atualziação
const intervaloEquipesRef = useRef<NodeJS.Timeout | null>(null);
const intervaloOrdensRef = useRef<NodeJS.Timeout | null>(null);

// Função para carregar as EQUIPES
const carregarEquipes = async () => {
  try {
    setCarregandoEquipes(true);
    const api = await getApi();
    const response = await api.get(`/api/v1/pcm/equipemanutencao/0/0/0/0`);

      setEquipes(response.data);
      setCarregandoEquipes(false);
      console.log('Dados recebidos Equipes:', response.data);

      if (intervaloEquipesRef.current) {
        clearInterval(intervaloEquipesRef.current);
        intervaloEquipesRef.current = null;
    } else {
      console.log('Nenhuma equipe encontrada.');
    }
  } catch (erro) {
    console.log('Erro ao carregar equipes. Tentando novamente...');
  } finally {
    setCarregandoEquipes(false);
  }
};

// Função para carregar as ORDENS
const carregarOrdens = async () => {
  try {
    setCarregandoOrdens(true);
    const api = await getApi();
    const whereBase64 = btoa('ODP_STATUS;IN;A');
    const response = await api.get(`/api/v1/pcp/ordensproducao/${whereBase64}/0/3/0`);

    setOrdens(response.data);
    setCarregandoOrdens(false);
    console.log('Dados recebidos Ordens:', response.data);

    if (intervaloOrdensRef.current) {
      clearInterval(intervaloOrdensRef.current);
      intervaloOrdensRef.current = null;
    } else {
      console.log('Nenhuma ordem encontrada.');
    }
  } catch (erro) {
    console.log('Erro ao carregar ordens');
    if (axios.isAxiosError(erro)) {
      console.log('Erro Axios:', erro.response?.data || erro.message);
    }
  } finally {
    setCarregandoOrdens(false);
  }
};

// Carregar EQUIPES quando o componente for montado
useEffect(() => {
    carregarEquipes();
    intervaloEquipesRef.current = setInterval(carregarEquipes, 4000);
    console.log('Tentando carregar equipes...');

  return () => {
    if (intervaloEquipesRef.current) {
      clearInterval(intervaloEquipesRef.current);
      intervaloEquipesRef.current = null;
      console.log('Intervalo limpo ao desmontar o componente.');
    }
  };
}, []);

// Carregar ORDENS quando o componente for montado
useEffect(() => {
  carregarOrdens();
  intervaloOrdensRef.current = setInterval(carregarOrdens, 4000);

  return () => {
    if (intervaloOrdensRef.current) {
      clearInterval(intervaloOrdensRef.current);
      intervaloOrdensRef.current = null;
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

  // Função para abrir os apontamentos de um funcionario
  const abrirApontamentos = async (idFuncionario: number, nomeFuncionario: string) => {
    try {
      // Pega os dados salvos no AsyncStorage com a chave apontamentos
      const dados = await AsyncStorage.getItem('apontamentos');
      // se tiver dados, transforma de JSON para uma lista de objetos
      const todosApontamentos = dados ? JSON.parse(dados) : [];
      // Filtra a lista para pegar só os apontamentos do funcionario com o id informado
      const filtrados = todosApontamentos.filter(
        (a: any) => a.funcionarioId === idFuncionario
      );
      // Salva esses apontamentos para mostrar na tela
      setApontamentosFuncionario(filtrados);
      // salva o nome do funcionario selecionado
      setNomeFuncionarioSelecionado(nomeFuncionario);
      // abre o modal que mostra os apontamentos na tela
      setModalVisivel(true);
    } catch (error) {
      console.error('Erro ao buscar apontamentos:', error);
    }
  };

  // Função para excluir um apontamento especifico do AsyncStorage
  const handleExcluirApontamento = async (apontamento: Apontamento) => {
    try {
      // recupera todos apontamentos que estão no AsyncStorage
      const dados = await AsyncStorage.getItem('apontamentos');
      // converte os dados de string para objeto
      const todosApontamentos = dados ? JSON.parse(dados) : [];
      // filta os apontamentos
      const atualizados = todosApontamentos.filter((a: Apontamento) =>
        !(
          a.funcionarioId === apontamento.funcionarioId &&
          a.ordemId === apontamento.ordemId &&
          a.data === apontamento.data &&
          a.horaInicio === apontamento.horaInicio &&
          a.horaFim === apontamento.horaFim
        )
      );
      // salva os apontamentos atualizados
      await AsyncStorage.setItem('apontamentos', JSON.stringify(atualizados));
  
      // filtra os apontamentos atualizados para mostrar apenas os do mesmo funcionario
      const atualizadosFuncionario = atualizados.filter(
        (a: any) => a.funcionarioId === apontamento.funcionarioId
      );
      
      // atualiza o estado da lista de apontamentos do funcionario especifico
      setApontamentosFuncionario(atualizadosFuncionario);
  
      console.log('Apontamento excluído com sucesso:', apontamento);
    } catch (error) {
      console.error('Erro ao excluir apontamento:', error);
    }
  };

  // função de pausar apontamento
  const pausarHora = async () => {
    // Verifica se a horaFimEditando não é vazia ou inválida
    if (!horaFimEditando || horaFimEditando.trim() === "") {
      console.error("Hora inválida");
      return;
    }

    // Verifica se o apontamento a ser editado realmente existe
    if (!apontamentoSendoEditado) {
      console.error("Apontamento não encontrado");
      return;
    }

    // Atualiza o apontamento no array
    const apontamentoAtualizado = apontamentosFuncionario.map((a) =>
      a.ordemId === apontamentoSendoEditado.ordemId && a.funcionarioId === apontamentoSendoEditado.funcionarioId
        ? { ...a, horaFim: horaFimEditando }
        : a
    );

    // Atualiza o estado com os apontamentos modificados
    setApontamentosFuncionario(apontamentoAtualizado);

    try {
      // Atualiza o AsyncStorage com os apontamentos modificados
      await AsyncStorage.setItem("apontamentos", JSON.stringify(apontamentoAtualizado));
    } catch (error) {
      console.error("Erro ao salvar no AsyncStorage", error);
    }

    // Limpa o estado de edição e de horaFim
    setHoraFimEditando(null);
    setApontamentoSendoEditado(null);

    // Mensagem de sucesso ou feedback de atualização
    console.log("Apontamento atualizado com sucesso!");
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
                  style={{ backgroundColor: "white", maxHeight: 50 }}
                  maxLength={5}
                  placeholder="00:00"
                  mode="outlined"
                />
          
                <Button
                  labelStyle={{ color: 'black' }}
                  mode="contained"
                  onPress={pausarHora}
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

// Estilização
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
