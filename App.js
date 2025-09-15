import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Telas de Autenticação
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Telas Principais do App
import DashboardScreen from './screens/DashboardScreen';
import RankingScreen from './screens.RankingScreen';
// import TrainingScreen from './screens/TrainingScreen'; // Futura tela

const AuthStack = createStackNavigator();
const AppTabs = createBottomTabNavigator();

// Navegação principal do app (pós-login)
function AppNavigator() {
    return (
        <AppTabs.Navigator
            // Esconde o cabeçalho e a barra de abas padrão para usarmos a nossa customizada
            screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
        >
            <AppTabs.Screen name="Dashboard" component={DashboardScreen} />
            <AppTabs.Screen name="Ranking" component={RankingScreen} />
            {/* <AppTabs.Screen name="Training" component={TrainingScreen} /> */}
        </AppTabs.Navigator>
    );
}

// Navegação geral que decide se mostra as telas de auth ou as telas do app
export default function App() {
    return (
        <NavigationContainer>
            <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
                <AuthStack.Screen name="Login" component={LoginScreen} />
                <AuthStack.Screen name="Register" component={RegisterScreen} />
                {/* A tela "App" contém toda a navegação interna do app */}
                <AuthStack.Screen name="App" component={AppNavigator} />
            </AuthStack.Navigator>
        </NavigationContainer>
    );
}