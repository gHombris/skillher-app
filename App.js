import React from 'react';
import { View, Text, TouchableOpacity,StyleSheet } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider , SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Telas
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import RankingScreen from './screens/RankingScreen';
import TrainingSelectionScreen from './screens/TrainingSelectionScreen';
import TrainingPlayerScreen from './screens/TrainingPlayerScreen';

const AuthStack = createStackNavigator();
const AppTabs = createBottomTabNavigator();
const TrainingStack = createStackNavigator();

// Criamos um "sub-navegador" para o fluxo de treino
function TrainingNavigator() {
    return (
        <TrainingStack.Navigator screenOptions={{ headerShown: false }}>
            <TrainingStack.Screen name="TrainingSelection" component={TrainingSelectionScreen} />
            <TrainingStack.Screen name="TrainingPlayer" component={TrainingPlayerScreen} />
        </TrainingStack.Navigator>
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
            <AppTabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Perfil' }} />
            <AppTabs.Screen name="Training" component={TrainingNavigator} options={{ tabBarLabel: 'Treinar' }}/>
            <AppTabs.Screen name="Ranking" component={RankingScreen} />
        </AppTabs.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                    <AuthStack.Screen name="App" component={AppNavigator} />
                </AuthStack.Navigator>
            </NavigationContainer>
            <StatusBar style="light" />
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