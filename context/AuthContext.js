import React, { createContext, useState, useContext, useEffect } from 'react';

const USER_DATA_KEY = 'skillher-user-data';
const LAST_TRAINING_KEY = 'skillher-last-training'; // <<< CHAVE PARA A DATA DO ÚLTIMO TREINO

// 1. Criamos o Contexto
const AuthContext = createContext(null);

// 2. Criamos o "Provedor" que vai guardar a informação
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // O usuário começa como nulo (deslogado)
    const [isLoading, setIsLoading] = useState(true);

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
                // 3. Termina o loading
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login =  (userData) => {
        try {
            // Salva o usuário no estado
            setUser(userData);
            // Salva o usuário no storage seguro
             localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        } catch (e) {
            console.error("Erro ao salvar usuário no storage:", e);
        }
    };

    const logout = () => {
        try {
            // Remove do estado
            setUser(null);
            // Remove do storage seguro
             localStorage.removeItem(USER_DATA_KEY);
             localStorage.removeItem(LAST_TRAINING_KEY); // <<< LIMPA A DATA DO TREINO
        } catch (e) {
            console.error("Erro ao remover usuário do storage:", e);
        }
    };

    // FUNÇÃO PARA ATUALIZAR A DATA DA SEQUÊNCIA/ÚLTIMO TREINO
    const updateStreak = () => {
        try {
            const today = new Date().toDateString();
            localStorage.setItem(LAST_TRAINING_KEY, today);
        } catch (e) {
             console.error("Erro ao salvar data do treino:", e);
        }
    };

    // FUNÇÃO PARA CHECAR A ÚLTIMA DATA DE TREINO
    const getLastTrainingDate = () => {
        try {
            return localStorage.getItem(LAST_TRAINING_KEY);
        } catch (e) {
            console.error("Erro ao ler data do treino:", e);
            return null;
        }
    };
    
    // <<< NOVO: FUNÇÃO PARA CALCULAR OS DIAS DESDE O ÚLTIMO TREINO >>>
    const getDaysSinceLastTraining = () => {
        try {
            const lastTrainingDateString = localStorage.getItem(LAST_TRAINING_KEY);
            if (!lastTrainingDateString) return 0; // Assume 0 se nunca treinou

            const lastTrainingDate = new Date(lastTrainingDateString);
            const today = new Date();

            // Seta os horários para meia-noite para comparar apenas as datas
            lastTrainingDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            // Calcula a diferença em milissegundos
            const diffTime = Math.abs(today.getTime() - lastTrainingDate.getTime());
            // Converte para dias (arredondando para cima)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            return diffDays;
        } catch (e) {
            console.error("Erro ao calcular dias desde o último treino:", e);
            return 0; 
        }
    };
    

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        updateStreak, 
        getLastTrainingDate, 
        getDaysSinceLastTraining, // <<< EXPOSTO
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Criamos um "Hook" (gancho) para facilitar o uso do contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};