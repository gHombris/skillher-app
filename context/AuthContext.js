import React, { createContext, useState, useContext, useEffect } from 'react';
// Usamos localStorage para este protótipo (web/mobile). Em um build nativo,
// seria trocado por 'expo-secure-store' ou 'AsyncStorage'.

/**
 * @summary Chave para salvar os dados do usuário no storage.
 */
const USER_DATA_KEY = 'skillher-user-data';
/**
 * @summary Chave para salvar a data do último treino (para a lógica de Sequência/Inatividade).
 */
const LAST_TRAINING_KEY = 'skillher-last-training';

/**
 * @summary Cria o Contexto de Autenticação.
 * Este contexto armazena o estado global do usuário (se está logado, dados do perfil)
 * e fornece funções para interagir com esse estado (login, logout, updateStreak).
 */
const AuthContext = createContext(null);

/**
 * @summary Provedor do Contexto de Autenticação.
 * Envolve a aplicação (no App.js) e gerencia o estado do usuário, 
 * persistindo os dados no localStorage para manter a sessão.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // O usuário começa como nulo (deslogado)
    const [isLoading, setIsLoading] = useState(true); // Controla a tela de loading inicial

    /**
     * @summary Efeito que carrega os dados do usuário do localStorage ao iniciar o app.
     * Isso garante que o usuário permaneça logado se já tiver uma sessão ativa.
     */
    useEffect(() => {
        const loadUserFromStorage =  () => {
            try {
                // 1. Tenta pegar os dados do usuário no storage
                const userDataString = localStorage.getItem(USER_DATA_KEY);
                if (userDataString) {
                    // 2. Se achou, restaura o usuário no estado
                    setUser(JSON.parse(userDataString));
                }
            } catch (e) {
                console.error("Erro ao carregar usuário do storage:", e);
            } finally {
                // 3. Termina o loading (mesmo se der erro)
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    /**
     * @summary Função de Login.
     * Atualiza o estado global do 'user' e salva os dados no storage.
     * @param {object} userData - Os dados do usuário vindos da API (Login/Register/Dashboard).
     */
    const login =  (userData) => {
        try {
            setUser(userData);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        } catch (e) {
            console.error("Erro ao salvar usuário no storage:", e);
        }
    };

    /**
     * @summary Função de Logout.
     * Limpa o estado global do 'user' e remove os dados do storage.
     */
    const logout = () => {
        try {
            setUser(null);
            localStorage.removeItem(USER_DATA_KEY);
            localStorage.removeItem(LAST_TRAINING_KEY); // Limpa a data do treino
        } catch (e) {
            console.error("Erro ao remover usuário do storage:", e);
        }
    };

    /**
     * @summary Salva a data de 'hoje' no storage.
     * Chamado quando um treino é concluído.
     */
    const updateStreak = () => {
        try {
            const today = new Date().toDateString();
            localStorage.setItem(LAST_TRAINING_KEY, today);
        } catch (e) {
             console.error("Erro ao salvar data do treino:", e);
        }
    };

    /**
     * @summary Retorna a data (string) do último treino salvo.
     */
    const getLastTrainingDate = () => {
        try {
            return localStorage.getItem(LAST_TRAINING_KEY);
        } catch (e) {
            console.error("Erro ao ler data do treino:", e);
            return null;
        }
    };
    
    /**
     * @summary Calcula quantos dias se passaram desde o último treino salvo.
     * Usado para a lógica de Rebaixamento por inatividade.
     * @returns {number} Número de dias desde o último treino.
     */
    const getDaysSinceLastTraining = () => {
        try {
            const lastTrainingDateString = localStorage.getItem(LAST_TRAINING_KEY);
            if (!lastTrainingDateString) return 0; // Assume 0 se nunca treinou

            const lastTrainingDate = new Date(lastTrainingDateString);
            const today = new Date();

            // Seta os horários para meia-noite para comparar apenas as datas
            lastTrainingDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            const diffTime = Math.abs(today.getTime() - lastTrainingDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            return diffDays;
        } catch (e) {
            console.error("Erro ao calcular dias desde o último treino:", e);
            return 0; 
        }
    };
    
    // Valores expostos pelo Provedor para o resto do app
    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        updateStreak, 
        getLastTrainingDate, 
        getDaysSinceLastTraining, 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * @summary Hook customizado para consumir o Contexto de Autenticação.
 * Facilita o acesso aos dados do usuário (ex: `const { user } = useAuth();`).
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};