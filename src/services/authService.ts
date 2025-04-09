// Serviço de autenticação
// Realiza a chamada da api para verificar se o usuário e senha estão corretos
// Utiliza a instância de api criada em api.ts basic auth.

import { createApi } from './api';

export const login = async (loginUsuario: string, senha: string) => {
  // Salva o login digitado como codigoUsuario
  const codigoUsuario = loginUsuario;

  // Cria a instância da api com o usuário e senha
  const api = createApi(loginUsuario, senha);

  try {
    // Faz a requisição GET para verificar se o usuário e senha estão corretos
    const response = await api.get(`/api/v1/usuario/usuario/${codigoUsuario}`);
    console.log('Login realizado com sucesso', response.data);

    // Se o status da resposta for 200, retorna os dados do usuário
    return response.data;
  } catch (error: any) {
    // Se a resposta for 401 (não autorizado), mostra mensagem de usuário ou senha inválidos
    // Senão, mostra uma mensagem genérica de erro 
    throw new Error(
      error.response?.status === 401
        ? 'Usuário ou senha inválidos.'
        : 'Erro ao conectar com o servidor.'
    );
  }
};