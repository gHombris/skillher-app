# ⚽ Skill Her - Aplicativo Mobile (Protótipo da Sprint 3)
# Integrantes 
  Gabriel Henrique Borges Hombris RM:566553
  Felipe Kolarevic Santos RM:565230
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Status](https://img.shields.io/badge/Status-Protótipo_Funcional-success)

Protótipo de um aplicativo mobile gamificado para o ensino de fundamentos de futebol feminino, desenvolvido como parte das Sprints 3 e 4. O aplicativo foi construído com React Native e Expo, e consome uma API para exibir dados dinâmicos das jogadoras.

## 📱 Telas Principais

_Aqui é um ótimo lugar para adicionar screenshots do seu aplicativo em funcionamento!_

| Login | Perfil (Dashboard) | Ranking |
| :---: | :---: | :---: |
| *(adicione o screenshot da tela de login aqui)* | *(adicione o screenshot da tela de perfil aqui)* | *(adicione o screenshot da tela de ranking aqui)* |

| Seleção de Treino | Player de Vídeo |
| :---: | :---: |
| *(adicione o screenshot da tela de treino aqui)* | *(adicione o screenshot da tela de vídeo aqui)* |


## ✨ Funcionalidades Implementadas

* **Fluxo de Autenticação:** Telas de Boas-Vindas, Login e Cadastro (protótipo navegável).
* **Dashboard de Perfil:** Visualização de progresso, XP, rank e estatísticas da jogadora.
* **Visualização de Perfis de Terceiros:** Navegação a partir do ranking para visualizar o perfil de outras jogadoras.
* **Ranking Semanal:** Lista de jogadoras com pontuação, incluindo zonas de promoção e rebaixamento.
* **Sistema de Treinos:**
    * Seleção de treinos por categoria.
    * Player de vídeo para exibir o tutorial de cada exercício.
    * Cronômetro para acompanhar o tempo de treino.
    * Card de recompensa (modal) ao finalizar um treino.
* **Consumo de API:** O aplicativo consome uma API externa (MockAPI) para buscar e exibir todos os dados das jogadoras de forma dinâmica.

## 🛠️ Tecnologias Utilizadas

* **React Native:** Framework para desenvolvimento de aplicativos móveis multiplataforma.
* **Expo:** Plataforma e conjunto de ferramentas para facilitar o desenvolvimento com React Native.
* **React Navigation:** Biblioteca para gerenciamento de rotas e navegação entre telas.
* **Axios:** Cliente HTTP para fazer as requisições à API.
* **Expo AV:** Biblioteca para reprodução dos vídeos de treino locais.

## 🚀 Como Executar

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
* [Git](https://git-scm.com/)
* **Expo CLI:** `npm install -g expo-cli`
* **App Expo Go:** Instalado no seu celular (Android ou iOS).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/gHombris/skillher-app.git](https://github.com/gHombris/skillher-app.git)
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd skillher-app
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    expo start
    ```

5.  **Execute no seu celular:**
    * Abra o aplicativo **Expo Go** no seu celular.
    * Escaneie o QR Code que apareceu no terminal ou na página do navegador.
    * O aplicativo será compilado e carregado no seu dispositivo.

## 🔌 Conexão com a API

Este aplicativo foi projetado para consumir uma API. A URL da API está configurada no arquivo `screens/DashboardScreen.js` (e em outras telas que a consomem).

Para esta entrega da Sprint 3, a URL configurada aponta para uma API mock criada no **MockAPI.io**, que cumpre o requisito de consumir uma API de terceiros.

```javascript
// Exemplo em screens/DashboardScreen.js
const API_BASE_URL = 'https://68ca054c430c4476c3480155.mockapi.io'; 
```
