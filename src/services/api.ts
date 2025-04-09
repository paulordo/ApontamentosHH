// Configurações da api
// Cria e retorna uma instância do Axios autenticada com o usuário e senha criptografada.
// Fornece a função getApi para reutilizar a instância autenticada em qualquer parte do app.

import axios from 'axios';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// cria a conexão com a api usando login e senha (criptografada com MD5)
export const createApi = (usuario: string, senha: string) => {
  // Criptografa a senha com MD5
  const senhaMd5 = CryptoJS.MD5(senha).toString();

  // Cria e retorna uma instância do Axios usando a base da URL da api e os dados da na autenticação com basic auth
  return axios.create({
    baseURL: 'http://191.242.244.192:9066',
    auth: {
      username: usuario,
      password: senhaMd5,
    },
  });
};

// função para pegar a instância da api já autenticada no asyncStorage
export const getApi = async () => {
  // Pega o usuário e senha salvos no AsyncStorage
  const usuario = await AsyncStorage.getItem('usuario');
  const senha = await AsyncStorage.getItem('senha');

  // Se não encontrar o usuário ou senha, mostra um erro
  if (!usuario || !senha) {
    throw new Error('Credenciais não encontradas');
  }

  // usa os dados para criar a instancia da api
  return createApi(usuario, senha);
};