import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { rankIconImages, avatarImages } from './DashboardScreen'; 
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

const CONQUISTAS_MAP = {
    'treino_1': { icon: 'star', color: '#FFD700', titulo: 'Primeiro Treino' },
    'sequencia_3': { icon: 'fire', color: '#FF4500', titulo: '3 Dias de Foco' },
    'sequencia_7': { icon: 'certificate', color: '#FF4500', titulo: 'Sequência Semanal' },
    'rank_up_1': { icon: 'level-up', color: '#00FFC2', titulo: 'Primeira Promoção' },
    'rank_up_3': { icon: 'rocket', color: '#00FFC2', titulo: 'Impulso na Carreira' },
};
// =========================================================================
// CRONÔMETRO DO RANKING
// =========================================================================

/**
 * Calcula o tempo restante em milissegundos até a próxima Segunda-feira à 00:00:00.
 */
const getTimeUntilNextReset = () => {
    const now = new Date();
    const nextReset = new Date(now);
    
    // Calcula quantos dias faltam para a próxima Segunda-feira (1). 
    // Onde: 0=Dom, 1=Seg, ..., 6=Sáb.
    let daysToAdd = (1 - now.getDay() + 7) % 7;
    
    // Se hoje é Segunda (daysToAdd === 0), o reset será na próxima Segunda (7 dias).
    if (daysToAdd === 0) {
        daysToAdd = 7;
    }
    
    // Adiciona os dias e zera o tempo para 00:00:00 (início do dia)
    nextReset.setDate(now.getDate() + daysToAdd);
    nextReset.setHours(0, 0, 0, 0); 

    const diff = nextReset.getTime() - now.getTime();
    return diff > 0 ? diff : 0;
};

/**
 * Formata milissegundos em string (X d Yh Zm Ws).
 */
const formatTimeDiff = (milliseconds) => {
    if (milliseconds <= 0) return 'Rank Resetando...';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

// =========================================================================


const RankingItem = React.memo(({ item, index, navigation }) => {
    const rankIconKey = (item.rank || 'Ferro').toLowerCase() + '.png';
    const rankIconImg = rankIconImages[rankIconKey] || rankIconImages['ferro.png'];
    const avatarImg = avatarImages[item.avatar_filename] || avatarImages['ana.png'];
    
    // FUNÇÃO CORRIGIDA PARA NAVEGAÇÃO ANINHADA
    const handleNavigateToProfile = () => {
     navigation.navigate('Dashboard', { 
            screen: 'ProfileDashboard', 
            params: { userId: item.id } 
        });
    }

    return (
        <TouchableOpacity 
            style={styles.itemContainer}
            // ATUALIZAÇÃO: Chamando a função corrigida
            onPress={handleNavigateToProfile}
        >
            <Text style={styles.rankText}>#{index + 1}</Text>
            
            <Image source={avatarImg} style={styles.avatar} />
            
            <View style={styles.nameRankContainer}>
                <Text style={styles.nameText}>{item.nome}</Text>
                <View style={styles.rankBadge}>
                    <Image source={rankIconImg} style={styles.rankIcon} />
                    <Text style={styles.rankNameText}>{item.rank}</Text>
                </View>
            </View>

            <View style={styles.xpContainer}>
                <Text style={styles.xpLabel}>XP</Text>
                <Text style={styles.xpValue}>{item.xp || 0}</Text>
            </View>
        </TouchableOpacity>
    );
});

export default function RankingScreen({ navigation }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    // Inicializa o estado com o tempo restante
    const [timeRemaining, setTimeRemaining] = useState(getTimeUntilNextReset()); 
    const { user, isLoading: userLoading, login } = useAuth();

    // Hook para o Cronômetro
    useEffect(() => {
        // Atualiza o tempo restante a cada segundo
        const interval = setInterval(() => {
            setTimeRemaining(getTimeUntilNextReset());
        }, 1000);

        // Limpa o intervalo quando a tela é desmontada
        return () => clearInterval(interval);
    }, []);

    const fetchRanking = useCallback(async () => {
        if (!user || !user.rank) return; 

        try {
            setLoading(true);
            const userRank = user.rank;
            
            // Busca e ordena
            const response = await axios.get(`${API_BASE_URL}?rank=${userRank}&sortBy=xp&order=desc`);
            const sortedRanking = response.data;
            
            setRanking(sortedRanking);
            
        } catch (error) {
            console.error("Erro ao buscar ranking:", error);
        } finally {
            setLoading(false);
        }
    }, [user, login]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchRanking);
        return unsubscribe;
    }, [navigation, fetchRanking]);
    
    // Se o tempo restante for zero (Resetando...), recarrega o ranking automaticamente
    useEffect(() => {
        // Checa se o tempo é zero ou muito próximo
        if (timeRemaining <= 1000 && !loading) {
            fetchRanking(); 
        }
    }, [timeRemaining, loading, fetchRanking]);
    
    
    if (loading) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.container}>
                
                <Text style={styles.headerTitle}>Ranking Semanal</Text>
                
                {/* O NOVO CRONÔMETRO */}
                <View style={styles.countdownContainer}>
                    <Text style={styles.countdownTitle}>Próximo Reset em:</Text>
                    <Text style={styles.countdownText}>{formatTimeDiff(timeRemaining)}</Text>
                </View>


                <FlatList
                    data={ranking}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <RankingItem item={item} index={index} navigation={navigation} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma jogadora no ranking ainda.</Text>}
                />

            </SafeAreaView>
        </LinearGradient>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    
    // ESTILOS ESPECÍFICOS DO CRONÔMETRO
    countdownContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 10,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 194, 0.5)', // Cor Skill Her
    },
    countdownTitle: {
        color: 'white',
        fontSize: 14,
        opacity: 0.8,
        fontWeight: '500',
    },
    countdownText: {
        color: '#00FFC2', // Destaque para o tempo
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
    },

    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 0, 50, 0.6)',
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#00FFC2',
    },
    rankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        width: 30,
        textAlign: 'center',
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'white',
    },
    nameRankContainer: {
        flex: 1,
    },
    nameText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    rankIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 5,
    },
    rankNameText: {
        color: '#00FFC2',
        fontSize: 12,
        fontWeight: '500',
    },
    xpContainer: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    xpLabel: {
        color: 'white',
        fontSize: 12,
        opacity: 0.7,
    },
    xpValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});