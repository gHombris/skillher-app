import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View, Text } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient'; 

// Telas
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import RankingScreen from './screens/RankingScreen';
import TrainingSelectionScreen from './screens/TrainingSelectionScreen';
import TrainingPlayerScreen from './screens/TrainingPlayerScreen';

// Stacks de Navegação
const AuthStack = createStackNavigator(); // Telas de login/registro
const AppTabs = createBottomTabNavigator(); // Navegação principal (Tabs)
const TrainingStack = createStackNavigator(); // Stack para o fluxo de Treino
const ProfileStack = createStackNavigator(); // Stack para o fluxo de Perfil

/**
 * @summary Stack Navigator para o fluxo de Treino.
 * Permite navegar da Seleção de Treino para o Player de Treino.
 */
function TrainingNavigator() {
    return (
        <TrainingStack.Navigator screenOptions={{ headerShown: false }}>
            <TrainingStack.Screen name="TrainingSelection" component={TrainingSelectionScreen} />
            <TrainingStack.Screen name="TrainingPlayer" component={TrainingPlayerScreen} />
        </TrainingStack.Navigator>
    );
}

/**
 * @summary Stack Navigator para o fluxo de Perfil.
 * Permite navegar do Dashboard (Perfil) para a Edição de Perfil.
 */
function ProfileNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileDashboard" component={DashboardScreen} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
        </ProfileStack.Navigator>
    );
}

/**
 * @summary Componente customizado da Barra de Abas (Tab Bar).
 * Cria o botão central "TREINAR" destacado.
 */
function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.tabBarSafeArea}>
            <View style={styles.tabBarContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Botão central "TREINAR"
                    if (route.name === 'Training') {
                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.trainingButton}
                            >
                                <Text style={styles.trainingButtonText}>TREINAR</Text>
                            </TouchableOpacity>
                        );
                    }

                    // Botões normais (Perfil, Ranking)
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.regularTab}
                        >
                            <Text style={{ color: isFocused ? '#00FFC2' : 'white', fontWeight: 'bold' }}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

/**
 * @summary Navegador de Abas principal da aplicação (quando logado).
 */
function AppNavigator() {
    return (
        <AppTabs.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <AppTabs.Screen 
                name="Dashboard" 
                component={ProfileNavigator} 
                options={{ tabBarLabel: 'Perfil' }} 
                listeners={({ navigation }) => ({
                    // Listener para corrigir o bug de navegação aninhada.
                    // Garante que clicar na aba "Perfil" sempre volte ao perfil
                    // do usuário logado, limpando o 'userId' de terceiros.
                    tabPress: (e) => {
                        e.preventDefault(); 
                        navigation.navigate('Dashboard', { 
                            screen: 'ProfileDashboard',
                            params: { userId: undefined }, 
                        });
                    },
                })}
            />
            <AppTabs.Screen 
                name="Training" 
                component={TrainingNavigator} 
                options={{ tabBarLabel: 'Treinar' }} 
            />
            <AppTabs.Screen 
                name="Ranking" 
                component={RankingScreen} 
                options={{ tabBarLabel: 'Ranking' }} 
            />
        </AppTabs.Navigator>
    );
}

/**
 * @summary Navegador Raiz (Root).
 * Decide qual fluxo de navegação mostrar (Autenticação ou App)
 * com base no estado 'isLoading' e 'user' do AuthContext.
 */
function RootNavigator() {
    const { user, isLoading } = useAuth(); // Pega o usuário e o estado de loading

    // Tela de loading inicial enquanto o AuthContext verifica o storage
    if (isLoading) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </LinearGradient>
        );
    }

    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                // 1. Usuário LOGADO: Mostra o app principal (AppNavigator)
                <AuthStack.Screen name="App" component={AppNavigator} />
            ) : (
                // 2. Usuário DESLOGADO: Mostra as telas de autenticação
                <>
                    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </AuthStack.Navigator>
    );
}

/**
 * @summary Componente principal.
 * Envolve toda a aplicação no AuthProvider (Contexto) e NavigationContainer (Rotas).
 */
export default function App() {
    return (
        <SafeAreaProvider style={styles.root}>
            <AuthProvider>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}

// --- ESTILOS  ---
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarSafeArea: {
        backgroundColor: 'rgba(30, 0, 50, 0.8)',
    },
    tabBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 0, 50, 0.8)'
    },
    regularTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    trainingButton: {
        flex: 1.2,
        backgroundColor: '#00FFC2',
        borderRadius: 25,
        paddingVertical: 12,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    trainingButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});