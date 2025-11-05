import React from 'react';
import { View, Text, TouchableOpacity,StyleSheet, ActivityIndicator } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider , SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Telas
import { AuthProvider , useAuth } from './context/AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import RankingScreen from './screens/RankingScreen';
import TrainingSelectionScreen from './screens/TrainingSelectionScreen';
import TrainingPlayerScreen from './screens/TrainingPlayerScreen';

const AuthStack = createStackNavigator();
const AppTabs = createBottomTabNavigator();
const TrainingStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Criamos um "sub-navegador" para o fluxo de treino
function TrainingNavigator() {
    return (
        <TrainingStack.Navigator screenOptions={{ headerShown: false }}>
            <TrainingStack.Screen name="TrainingSelection" component={TrainingSelectionScreen} />
            <TrainingStack.Screen name="TrainingPlayer" component={TrainingPlayerScreen} />
        </TrainingStack.Navigator>
    );
}
function ProfileNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileDashboard" component={DashboardScreen} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
        </ProfileStack.Navigator>
    );
}
// --- Componente de Barra de Abas Customizado (LÓGICA COMPLETA) ---
function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={{ backgroundColor: 'rgba(30, 0, 50, 0.8)' }}>
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

                    // A MUDANÇA ESTÁ AQUI:
                    // Se a rota for 'Training', renderizamos o botão grande e central.
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

                    // Para as outras rotas ('Dashboard', 'Ranking'), renderizamos o botão normal.
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

function AppNavigator() {
    return (
        <AppTabs.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <AppTabs.Screen name="Dashboard" component={ProfileNavigator} options={{ tabBarLabel: 'Perfil' }} />
            <AppTabs.Screen name="Training" component={TrainingNavigator} options={{ tabBarLabel: 'Treinar' }}/>
            <AppTabs.Screen name="Ranking" component={RankingScreen} />
        </AppTabs.Navigator>
    );
}
function RootNavigator() {
    const { user, isLoading } = useAuth();

    // Se estivermos carregando o usuário do storage, mostre uma tela de loading
    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4D008C'}}>
                <ActivityIndicator size="large" color="#00FFC2" />
            </View>
        );
    }

    // Após carregar, decidimos qual Stack mostrar
    return (
        <NavigationContainer>
            {/* Se houver usuário, mostre o App. Se não, mostre as telas de login. */}
            <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Já está logado, vai direto pro App
                    <AuthStack.Screen name="App" component={AppNavigator} />
                ) : (
                    // Não está logado, fluxo de autenticação
                    <>
                        <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
                        <AuthStack.Screen name="Login" component={LoginScreen} />
                        <AuthStack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </AuthStack.Navigator>
        </NavigationContainer>
    );
}
export default function App() {
    return (
        <SafeAreaProvider style={styles.root}>
            <AuthProvider>
                {/* // <<< MODIFICADO: Usamos o RootNavigator */}
                <RootNavigator />
                <StatusBar style="light" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
    },
    regularTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    trainingButton: {
        flex: 1.2, // Ocupa um pouco mais de espaço
        backgroundColor: '#00FFC2',
        borderRadius: 25,
        paddingVertical: 12,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    trainingButtonActive: {
        // Podemos adicionar um estilo para quando a aba de treino estiver ativa, se quisermos
    },
    trainingButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});