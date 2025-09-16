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

const AuthStack = createStackNavigator();
const AppTabs = createBottomTabNavigator();

// --- Componente de Barra de Abas Customizado ---
function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const orderedRoutes = [
        state.routes.find(r => r.name === 'Dashboard'),
        { name: 'Training', custom: true }, 
        state.routes.find(r => r.name === 'Ranking')
    ];

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
            <AppTabs.Screen name="Training" component={TrainingSelectionScreen} options={{ tabBarLabel: 'Treinar' }}/>
            <AppTabs.Screen name="Ranking" component={RankingScreen} />
        </AppTabs.Navigator>
    );
}

// Navegação geral
export default function App() {
    const styles = StyleSheet.create({
    trainingButton: {
        flex: 1,
        backgroundColor: '#00FFC2',
        borderRadius: 25,
        paddingVertical: 10,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
       
        elevation: 5,
    },
    trainingButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
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