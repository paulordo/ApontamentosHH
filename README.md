# 📲 ApontamentosHH

O **ApontamentosHH** é um aplicativo mobile desenvolvido em **React Native com TypeScript**, criado como parte de um **teste técnico profissional** e também com fins educacionais. Ele simula um sistema real de **apontamentos de ordens de produção**, integrando-se a um **webservice legado em Delphi**, com autenticação, consulta de dados e registros com armazenamento local.

---

## 🚀 Funcionalidades

- 🔐 Autenticação via Basic Auth com senha criptografada em MD5.
- 📡 Consumo de APIs REST para:
  - Usuários
  - Equipes de manutenção
  - Ordens de produção
- ⏱️ Registro de apontamentos com data e hora de início e fim.
- 🖼️ Feedback visual indicando seleção de itens (ex: cor do usuário alterada após seleção).
- 📝 O backend utiliza Microsoft Timestamp (Double) para datas, e embora o projeto tenha suporte a conversão com Moment.js, as datas do servidor não foram utilizadas diretamente na versão final.
- ⚙️ Arquitetura organizada com componentização da interface e lógica.

## 🧪 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-native-paper](https://callstack.github.io/react-native-paper/) (UI)
- [Moment.js](https://momentjs.com/) (conversão de datas)
- [Yarn](https://yarnpkg.com/) (gerenciador de pacotes)
- Webservice legado em **Delphi** (backend da API)

## 📸 Screenshots do App
- Tela de Login
  - Permite que o usuário se autentique via Basic Auth com senha criptografada em MD5.
  <img src="https://github.com/user-attachments/assets/6f44d1e7-f7d4-4ad8-935a-317e0ab30ea6" width="500"/>

- Tela Home (Após Login)
  - Exibe as principais ações do app, como seleção de usuário, ordem e formulário para registro de apontamentos.
  <img src="https://github.com/user-attachments/assets/fffada8e-608b-4b37-a118-7228c6306a42" width="500"/>

- Visualização e edição de apontamentos registrados
  - Interface para visualização e edição de um apontamento realizado vinculado ao colaborador específico.
  <img src="https://github.com/user-attachments/assets/a552eb09-ea9f-4d3b-bff4-3a0a146bfe81" width="500"/>

---

## 📂 Estrutura do Projeto (Resumo)

```bash
ApontamentosHH/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── screens/             # Telas (Login, Home, etc)
│   ├── services/            # Integração com API e funções auxiliares
│   └── App.tsx              # Ponto de entrada
├── assets/                  # Imagens e fontes
├── README.md
└── package.json
```
---

## 🔑 Autenticação
O app utiliza Basic Auth, enviando o login e a senha (criptografada em MD5) no cabeçalho da requisição.

- As credenciais são enviadas no cabeçalho HTTP como Authorization: Basic <credenciaisBase64>.
- A senha do usuário é criptografada com MD5 antes de ser enviada.
- O servidor valida as credenciais e responde com os dados ou erro 401 Unauthorized.

---

## 📦 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/paulordo/ApontamentosHH.git
cd ApontamentosHH

# Instale as dependências
yarn install

# Execute o app
npx react-native run-android
# ou
npx react-native run-ios
```
---

## 📌 Observações

- Os dados de data/hora que vêm do servidor estão em formato Microsoft Timestamp (Double) e são convertidos utilizando Moment.js.
- A comunicação com o backend exige conexão com a API fornecida pelo sistema legado.

## 🎯 Objetivo do Projeto
Este projeto foi desenvolvido para:

- Atender a um teste técnico de uma empresa, demonstrando conhecimento prático em React Native.
- Servir como projeto de aprendizado, focando em integração com sistemas legados e boas práticas de desenvolvimento mobile.
- Simular um sistema real de apontamentos utilizado em ambientes industriais.

## 🧠 Aprendizados
- Consumo de APIs com autenticação personalizada.
- Conversão de dados legados.
- Estruturação de apps mobile em React Native.
- Componentização e organização de código em TypeScript.
- Execução local de app mobile usando Android Emulator.
- Aprendizado prático com prazo e requisitos reais de um teste técnico.

## 📬 Contato

- Se quiser saber mais sobre o projeto ou entrar em contato comigo:
  - 📧 pauloricardo10082003@gmail.com
  - 💼 https://www.linkedin.com/in/paulo-oliveira-5a1913172/
