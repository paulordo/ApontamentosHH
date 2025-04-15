import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import axios from 'axios';
import { encode as btoa } from 'base-64';
import { getApi } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator, Text } from 'react-native-paper';
import CardFuncionario from '../components/CardFuncionario';
import CardOrdens from '../components/CardOrdens';

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

interface Ordem {
  ODP_NRPREORDEM: string;
  ODP_PRODUTO: string;
}

export default function Home() {
  // definição de estados para as ordens, equipes e equipe selecionada
  const [equipes, setEquipes] = useState<any[]>([]); 
  const [equipeSelecionada, setEquipeSelecionada] = useState<string | null>(null);
  const [carregaEquipes, setCarregando] = useState<boolean>(true);
  const [, setErroCarregamento] = useState(false);
  const [carregaOrdens, setCarregandoOrdens] = useState<boolean>(true);
  const [ordens, setOrdens] = useState<Ordem[]>([]);

  // Função CARREGAEQUIPES
  useEffect(() => {
    // Declara a variável para armazenar o ID do intervalo
    let intervalo: NodeJS.Timeout;

    // Função assíncrona responsável por carregar as equipes
    const carregaEquipes = async () => {
      try {
        console.log('Tentando carregar equipes...');

        // Define que a equipe está sendo carregada
        setCarregando(true); 

         // Parâmetros usados na URL da requisição
         const ID_EQUIPE = '0';  // ID da equipe
         const WHERE = '0';      // Filtro adicional
         const FIRST = '0';      // Número de itens a serem retornados
         const SKIP = '0';       // Pular itens   

         // Monta a URL com os parâmetros acima
        const url = `/api/v1/pcm/equipemanutencao/${ID_EQUIPE}/${WHERE}/${FIRST}/${SKIP}`;

        // Obtém a instância da API com autenticação configurada
        const api = await getApi();

        // Faz a requisição GET para a API
        const response = await api.get(url);
        console.log('Dados recebidos:', response.data); // Exibe os dados recebidos da API

         // Atualiza o estado com os dados recebidos e indica que o carregamento foi concluído
        setEquipes(response.data);
        setErroCarregamento(false);
        setCarregando(false); 

        // Limpa o intervalo de requisição para evitar chamadas repetidas
        clearInterval(intervalo); 

      } catch (erro) {
        // Se ocorrer um erro durante a requisição
        setErroCarregamento(true); // Marca que houve erro no carregamento
        setCarregando(true); // Marca que ainda está carregando (mesmo após erro)
        console.log('Erro ao carregar. Tentando novamente...');

        // Verifica o tipo do erro
        if (axios.isAxiosError(erro)) {
          console.log("erro axios:", erro.response?.data);
        } else if (erro instanceof Error) {
          console.log("erro:", erro.message);
        } else {
          console.log("erro desconhecido:", erro);
        }
      }
    };

    // Inicia o intervalo para tentar recarregar as equipes a cada 3 segundos
    intervalo = setInterval(() => {
      carregaEquipes();
    }, 3000);

    // Chama a função carregaEquipes para carregar os dados imediatamente quando o componente for montado
    carregaEquipes();

    // Limpa o intervalo para evitar chamadas repetidas após o componente ser desmontado
    return () => clearInterval(intervalo);

  }, []); // O array vazio [] garante que o useEffect será chamado apenas uma vez (componente montado)

  const equipe = equipes.find(e => e.EQM_CODIGO === equipeSelecionada);

  // Função CARREGAORDENS
  useEffect(() => {
    // Declara a variável para armazenar o intervalo
    let intervalo: NodeJS.Timeout;
  
    // Função assíncrona responsável por buscar as ordens de produção
    const carregaOrdens = async () => {
      try {
        // Indica que as ordens estão sendo carregadas
        setCarregandoOrdens(true);
  
        // Obtém a instância da API com a autenticação configurada
        const api = await getApi();
  
        // Define os parâmetros da URL
        const WHERE = 'ODP_STATUS;IN;A,P,E'; // Filtra ordens com status A, P ou E
        const WHERE_BASE64 = btoa(WHERE);    // Converte o WHERE para base64
        const ID_ORDEM = '0';                // ID de ordem usado como filtro
        const FIRST = '1';                   // Quantidade de itens a retornar (paginado)
        const SKIP = '0';                    // Quantidade de itens a pular (paginado)
  
        // Monta a URL do endpoint com os parâmetros
        const url = `/api/v1/pcp/ordensproducao/${WHERE_BASE64}/${ID_ORDEM}/${FIRST}/${SKIP}`;
        console.log('[ORDENS] URL:', url);
  
        // Faz a requisição GET à API
        const response = await api.get(url, {
          headers: {
            Accept: 'application/json',
          },
          responseType: 'json',
        });
  
        // Extrai os dados da resposta
        const data = response.data;
  
        // Verifica se os dados recebidos são válidos
        if (Array.isArray(data) && data.length > 0) {
          setOrdens(data);                  // Atualiza o estado com as ordens
          setCarregandoOrdens(false);       // Finaliza o carregamento
          clearInterval(intervalo);         // Interrompe o intervalo de atualização automática
          console.log('[ORDENS] Ordens carregadas com sucesso:', data.length, 'itens');
        } else {
          // Caso não haja ordens válidas, exibe aviso no console
          console.log('[ORDENS] Nenhuma ordem válida encontrada. Dados:', data);
        }
      } catch (erro: any) {
        setCarregandoOrdens(false);
        console.log('[ORDENS] Erro ao carregar ordens. Tentando novamente...');
        // Se for erro da API, exibe os detalhes da resposta
        if (erro.response) {
          console.log('[ORDENS] Axios response error:', erro.response?.data || 'Resposta vazia');
        }
      }
    };
  
    // Executa a primeira chamada para carregar ordens assim que o componente monta
    carregaOrdens();
  
    // Inicia um intervalo para tentar recarregar as ordens a cada 3 segundos
    intervalo = setInterval(() => {
      carregaOrdens();
    }, 3000);
  
    // Limpa o intervalo 
    return () => clearInterval(intervalo);
  }, []); // O array vazio [] garante que o useEffect será chamado apenas uma vez (componente montado)
  
  
  // estilização
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
  
  // Renderizando a tela home
  return (
    <View style={styles.container}>
      {carregaEquipes ? (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={{ marginTop: 10, color: '#333' }}>Carregando equipes...</Text>
        </View>
      ) : (
        <>
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              {equipe && (
                <CardFuncionario
                  nomeEquipe={equipe.EQM_DESCRICAO}
                  pessoas={equipe.PESSOAS}
                  carregando={carregaEquipes}
                />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <CardOrdens ordens={ordens} carregando={carregaOrdens} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}  
