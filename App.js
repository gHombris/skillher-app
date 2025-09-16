import React from 'react';
// A LINHA ABAIXO É A CORREÇÃO. PRECISAMOS IMPORTAR OS COMPONENTES QUE USAMOS.
import { View, Text, TouchableOpacity } from 'react-native'; 
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

const AuthStack = createStackNavigator();
const AppTabs = createBottomTabNavigator();

// --- Componente de Barra de Abas Customizado ---
function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        
        <SafeAreaView edges={['bottom', 'left', 'right']} style={{ backgroundColor: 'rgba(30, 0, 50, 0.8)' }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10,paddingTop: 10 + insets.bottom, backgroundColor: 'rgba(30, 0, 50, 0.8)' }}>
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

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={onPress}
                        style={{ flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: isFocused ? '#00FFC2' : 'transparent' }}
                    >
                        <Text style={{ color: isFocused ? 'black' : 'white', textAlign: 'center', fontWeight: 'bold' }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </SafeAreaView>
    );
}

// Navegação principal do app (pós-login)
function AppNavigator() {
    return (
        <AppTabs.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <AppTabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Perfil' }} />
            <AppTabs.Screen name="Ranking" component={RankingScreen} />
        </AppTabs.Navigator>
    );
}

// Navegação geral
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