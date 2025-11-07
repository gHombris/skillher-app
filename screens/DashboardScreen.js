import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// ==================================================
// CORREÇÃO BUG AVATARES: Mapas limpos
// Contêm apenas os nomes de arquivos REAIS.
// ==================================================
export const avatarImages = {
    'emilly.png': require('../assets/avatares/emilly.png'),
    'ana.png': require('../assets/avatares/ana.png'),
    'maria.png': require('../assets/avatares/maria.png'),
    'tatiana.png': require('../assets/avatares/tatiana.png'),
    'ester.png': require('../assets/avatares/ester.png'),
    'andreia.png': require('../assets/avatares/andreia.png'),
    'monique.png': require('../assets/avatares/monique.png'),
    'luana_pereira.png': require('../assets/avatares/luana.png'),
    'marta-futebol-brasil.png': require('../assets/avatares/marta-futebol-brasil.png'),
    // Os avatares genéricos da API foram removidos daqui
    // para limpar a tela de EditProfile.
};

export const rankIconImages = {
    'ferro.png': require('../assets/ranks/ferro.png'),
    'bronze.png': require('../assets/ranks/bronze.png'),
    'prata.png': require('../assets/ranks/prata.png'),
    'ouro.png': require('../assets/ranks/ouro.png'),
    'rubi.png': require('../assets/ranks/rubi.png'),
    'ametista.png': require('../assets/ranks/ametista.png'),
    'safira.png': require('../assets/ranks/safira.png'),
    'diamante.png': require('../assets/ranks/diamante.png'),
};
// ==================================================

// Mapa de XP (Lógica do frontend)
const RANK_XP_MAP = {
    'Ferro': { proximo: 50, anterior: 0 },
    'Bronze': { proximo: 100, anterior: 50 },
    'Prata': { proximo: 200, anterior: 100 },
    'Ouro': { proximo: 400, anterior: 200 },
    'Rubi': { proximo: 800, anterior: 400 },
    'Ametista': { proximo: 1500, anterior: 800 },
    'Safira': { proximo: 2500, anterior: 1500 },
    'Diamante': { proximo: 9999, anterior: 2500 },
    // Fallbacks
    'rank 1': { proximo: 50, anterior: 0 },
    'rank 2': { proximo: 100, anterior: 50 },
    'rank 3': { proximo: 100, anterior: 50 },
    'rank 4': { proximo: 50, anterior: 0 },
    'rank 5': { proximo: 50, anterior: 0 },
};

// Mapa de Conquistas
const CONQUISTAS_MAP = {
    'treino_1': { icone: '🥇', titulo: 'Primeiro Treino' },
    'treino_10': { icone: '🏆', titulo: '10 Treinos Concluídos' },
};


export default function DashboardScreen({ route, navigation }) {
    const { user: loggedInUser, logout, login } = useAuth(); 
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lógica de busca de dados
    const fetchPlayerData = useCallback(async () => {
        // CORREÇÃO BUG 1: O ID a ser mostrado é o da rota (se existir)
        // ou o do usuário logado.
        const userIdToDisplay = route.params?.userId || loggedInUser?.id;

        if (!userIdToDisplay) {
            setLoading(false);
            setError("Nenhum usuário para exibir.");
            return;
        }

        try {
            // CORREÇÃO "TICK": Limpa dados antigos
            setPlayerData(null); 
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`${API_BASE_URL}/${userIdToDisplay}`);
            setPlayerData(response.data);

            if (String(response.data.id) === String(loggedInUser?.id)) {
                login(response.data);
            }
        } catch (err) {
            setError("Não foi possível carregar o perfil.");
            console.error("Erro ao buscar da API (MockAPI):", err);
        } finally {
            setLoading(false);
        }
    // CORREÇÃO BUG 1: A dependência DEVE ser 'loggedInUser.id' (primitivo)
    }, [route.params?.userId, loggedInUser?.id, login]); 


    // Listener para recarregar a tela (Correção Stale XP)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPlayerData();
        });
        return unsubscribe;
    }, [navigation, fetchPlayerData]);

    // CORREÇÃO BUG 2: Logout
    const handleLogout = () => {
        const doLogout = () => {
            logout(); // Limpa o AuthContext e o localStorage
            // Manda o usuário de volta para a tela de Welcome
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Você tem certeza que deseja sair?")) {
                doLogout();
            }
        } else {
            Alert.alert(
                "Sair da conta",
                "Você tem certeza que deseja sair?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { 
                        text: "Sair", 
                        style: "destructive", 
                        onPress: doLogout
                    }
                ]
            );
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </LinearGradient>
        );
    }
    
    if (error || !playerData) {
         return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <Text style={styles.errorText}>
                    {error || "Usuário não encontrado."}
                </Text>
            </LinearGradient>
        );
    }

    const isOwnProfile = String(playerData.id) === String(loggedInUser?.id);
    const rankInfo = RANK_XP_MAP[playerData.rank] || RANK_XP_MAP['Ferro'];
    const xpNoRankAtual = (playerData.xp || 0) - rankInfo.anterior;
    const xpTotalDoRank = rankInfo.proximo - rankInfo.anterior;
    const xpPercentage = (xpNoRankAtual / xpTotalDoRank) * 100;
    
    const rankIconKey = (playerData.rank || 'Ferro').toLowerCase() + '.png';
    const rankIconImg = rankIconImages[rankIconKey] || rankIconImages['ferro.png'];
    const avatarImg = avatarImages[playerData.avatar_filename] || avatarImages['ana.png'];
    const conquistasDoJogador = Array.isArray(playerData.conquistas) ? playerData.conquistas : [];
    
    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.container}>
                <ScrollView 
                    style={styles.container} 
                    contentContainerStyle={styles.scrollContent}
                >
                    
                    <Text style={styles.headerTitle}>{isOwnProfile ? "Bem-vinda de volta!" : `Perfil de ${playerData.nome}`}</Text>

                    <Image source={avatarImg} style={styles.avatar} /> 
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{playerData.nome}</Text>
                        
                        {isOwnProfile && (
                            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.card}>
                        <View style={styles.rankInfo}>
                            <Image source={rankIconImg} style={styles.rankIcon} />
                            <View style={styles.rankTextContainer}>
                                <Text style={styles.rankText}>Rank: {playerData.rank}</Text>
                                <Text style={styles.xpText}>{playerData.xp} XP (Próx. Rank: {rankInfo.proximo} XP)</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${xpPercentage}%` }]} />
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statIcon}>👟</Text>
                            <Text style={styles.statLabel}>Treinos Concluídos: {playerData.treinos_concluidos}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statIcon}>🔥</Text>
                            <Text style={styles.statLabel}>Sequência: {playerData.sequencia}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.conquistasTitle}>Conquistas</Text>
                        <View style={styles.conquistasGrid}>
                            {conquistasDoJogador.length > 0 ? (
                                conquistasDoJogador.map((key) => (
                                    <View style={styles.conquistaItem} key={key}>
                                        <Text style={styles.conquistaIcon}>{CONQUISTAS_MAP[key]?.icone || '❓'}</Text>
                                        <Text style={styles.conquistaText}>{CONQUISTAS_MAP[key]?.titulo || key}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.conquistaEmpty}>Continue treinando para desbloquear conquistas!</Text>
                            )}
                        </View>
                    </View>

                    {isOwnProfile && (
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ESTILOS (O mesmo código que você enviou)
const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'white', 
        fontSize: 16, 
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    container: { flex: 1 }, 
    safeArea: { flex: 1 },
    scrollContent: { 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 20, 
        paddingBottom: 60, 
        flexGrow: 1, 
    },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white', marginBottom: 10 },
    nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    name: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    editIcon: { fontSize: 20, marginLeft: 10 },
    card: { backgroundColor: 'rgba(30, 0, 50, 0.6)', borderRadius: 15, padding: 20, width: '100%', marginBottom: 15 },
    rankInfo: { flexDirection: 'row', alignItems: 'center' },
    rankIcon: { width: 60, height: 60, resizeMode: 'contain', marginRight: 15 },
    rankTextContainer: { flex: 1 },
    rankText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    xpText: { color: '#00FFC2', fontSize: 14 },
    progressBarBackground: { height: 8, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
    progressBarForeground: { height: '100%', backgroundColor: '#00FFC2', borderRadius: 4 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
    statBox: { backgroundColor: 'rgba(30, 0, 50, 0.6)', borderRadius: 15, padding: 20, width: '48%', alignItems: 'center' },
    statIcon: { fontSize: 24, marginBottom: 5 },
    statLabel: { color: 'white', fontSize: 14, textAlign: 'center' },
    
    conquistasTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    conquistasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    conquistaItem: {
        alignItems: 'center',
        margin: 10,
        width: 80,
    },
    conquistaIcon: {
        fontSize: 40,
    },
    conquistaText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },
    conquistaEmpty: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
    
    logoutButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'red',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});