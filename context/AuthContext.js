import React, { createContext, useState, useContext, useEffect } from 'react';

const USER_DATA_KEY = 'skillher-user-data';

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
        } catch (e) {
            console.error("Erro ao remover usuário do storage:", e);
        }
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading 
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