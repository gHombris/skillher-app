import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios'; 

import { useAuth } from '../context/AuthContext';

// --- DADOS DE CONFIGURAÇÃO ---
const API_BASE_URL = 'http://192.168.15.173:5000'; 

// UM "MAPA" PARA AS IMAGENS
export const avatarImages = {
    'emilly.png': require('../assets/avatares/emilly.png'),
    'ana.png': require('../assets/avatares/ana.png'),
    'maria.png': require('../assets/avatares/maria.png'),
    'tatiana.png': require('../assets/avatares/tatiana.png'),
    'ester.png': require('../assets/avatares/ester.png'),
    'andreia.png': require('../assets/avatares/andreia.png'),
    'monique.png': require('../assets/avatares/monique.png'),
    'luana_pereira.png': require('../assets/avatares/luana.png'),
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

const RANK_XP_MAP = {
    'Ferro': { proximo: 50, anterior: 0 },
    'Bronze': { proximo: 100, anterior: 50 },
    'Prata': { proximo: 200, anterior: 100 },
    'Ouro': { proximo: 400, anterior: 200 },
    'Rubi': { proximo: 800, anterior: 400 },
    'Ametista': { proximo: 1500, anterior: 800 },
    'Safira': { proximo: 2500, anterior: 1500 },
    'Diamante': { proximo: 9999, anterior: 2500 }, 
};


export default function DashboardScreen({ route, navigation }) {
    const { user: loggedInUser } = useAuth();

    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // O useEffect busca os dados da API
    useEffect(() => {
        const userIdToDisplay = route.params?.userId || loggedInUser?.id;

        if (!userIdToDisplay) {
            setError("Usuário não encontrado.");
            setLoading(false);
            return;
        }

        const fetchPlayerData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}/api/jogadora/${userIdToDisplay}`);
                setPlayerData(response.data);
            } catch (err) {
                setError("Não foi possível carregar o perfil.");
                console.error("Erro ao buscar da API:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, [route.params?.userId, loggedInUser]);

    // Telas de Carregamento e Erro
    if (loading) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </LinearGradient>
        );
    }
    if (error) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <Text style={{color: 'white', fontSize: 16, textAlign: 'center'}}>{error}</Text>
            </LinearGradient>
        );
    }
    if (!playerData) return null;

    const isOwnProfile = playerData.id === loggedInUser?.id;

    
    const rankInfo = RANK_XP_MAP[playerData.rank] || RANK_XP_MAP['Ferro'];
    const xpNoRankAtual = playerData.xp - rankInfo.anterior;
    const xpTotalDoRank = rankInfo.proximo - rankInfo.anterior;
    const xpPercentage = (xpNoRankAtual / xpTotalDoRank) * 100;
    
    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={{flex:1}}>
            <SafeAreaView style={{flex:1}}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    <Text style={styles.headerTitle}>{isOwnProfile ? "Bem-vinda de volta!" : `Perfil de ${playerData.nome}`}</Text>

                    {/* // <<< CORRIGIDO: Usa 'avatar_filename' */}
                    <Image source={avatarImages[playerData.avatar_filename]} style={styles.avatar} /> 
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
                            {/* // <<< CORRIGIDO: Usa 'playerData.rank' para achar o .png */}
                            <Image source={rankIconImages[playerData.rank.toLowerCase() + '.png']} style={styles.rankIcon} />
                            <View style={styles.rankTextContainer}>
                                <Text style={styles.rankText}>Rank: {playerData.rank}</Text>
                                {/* // <<< MODIFICADO: Mostra o progresso do rank */}
                                <Text style={styles.xpText}>{playerData.xp} XP (Próx. Rank: {rankInfo.proximo} XP)</Text>
                            </View>
                        </View>
                        {/* // <<< CORRIGIDO: Usa a porcentagem correta */}
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

                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.conquistasTitle}>Conquistas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
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
    conquistasTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});