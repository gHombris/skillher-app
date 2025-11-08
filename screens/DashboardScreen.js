import React, { useState, useEffect, useCallback } from 'react';
import { 
    SafeAreaView, 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    ActivityIndicator, 
    Alert, 
    Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 
import { FontAwesome } from '@expo/vector-icons'; // Usado para os ícones de Conquistas

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// =========================================================================
// 1. Mapeamento de Assets e Constantes
// =========================================================================

// Mapeamento de Avatares (para 'EditProfileScreen' e 'RankingScreen')
export const avatarImages = {
    'avatar1.png': require('../assets/avatares/avatar1.png'),
    'avatar2.png': require('../assets/avatares/avatar2.png'),
    'avatar3.png': require('../assets/avatares/avatar3.png'),
    'avatar4.png': require('../assets/avatares/avatar4.png'),
    'avatar5.png': require('../assets/avatares/avatar5.png'),
    'avatar6.png': require('../assets/avatares/avatar6.png'),
};

// Mapeamento de Ranks (Minúsculas para consistência com assets)
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

// Importação dos Novos Ícones de assets
const iconEditar = require('../assets/icons/editar.png');
const iconCheckmark = require('../assets/icons/treino.png'); 
const iconFogo0 = require('../assets/icons/fogo0.png');           
const iconFogo1 = require('../assets/icons/fogo1.png');           
const iconFogo15 = require('../assets/icons/fogo15.png');         

// Ordem Canônica dos Ranks (Define a progressão)
const RANK_ORDER = [
    'Ferro', 'Bronze', 'Prata', 'Ouro', 'Rubi', 'Ametista', 'Safira', 'Diamante'
];

// Mapa de XP (Define os limites de cada rank)
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

// Mapeamento de Conquistas (Define a exibição)
const CONQUISTAS_MAP = {
    'treino_1': { icon: 'star', color: '#FFD700', titulo: 'Primeiro Treino' },
    'treino_10': { icon: 'trophy', color: '#FFD700', titulo: '10 Treinos Concluídos' },
    'sequencia_3': { icon: 'fire', color: '#FF4500', titulo: '3 Dias de Foco' },
    'sequencia_7': { icon: 'certificate', color: '#FF4500', titulo: 'Sequência Semanal' },
    'rank_up_1': { icon: 'level-up', color: '#00FFC2', titulo: 'Primeira Promoção' },
    'rank_up_3': { icon: 'rocket', color: '#00FFC2', titulo: 'Impulso na Carreira' },
};


// =========================================================================
// 2. Lógica de Rebaixamento (Gamificação)
// =========================================================================

/**
 * @summary Verifica se o usuário deve ser rebaixado por inatividade e XP baixo.
 * Esta função é chamada ao carregar o dashboard do usuário logado.
 * @param {object} currentUser - O objeto do usuário atual.
 * @param {function} getDaysSinceLastTraining - Função do AuthContext.
 * @param {function} login - Função do AuthContext para atualizar o usuário.
 */
const checkRelegation = async (currentUser, getDaysSinceLastTraining, login) => {
    const { id, xp, rank } = currentUser;
    
    // Regra: 7 dias ou mais de inatividade
    const INACTIVITY_THRESHOLD_DAYS = 7; 
    const daysInactive = getDaysSinceLastTraining();

    // 1. Não rebaixa se for 'Ferro' (rank mínimo) ou se estiver ativo
    if (rank === 'Ferro' || daysInactive < INACTIVITY_THRESHOLD_DAYS) {
        return; 
    }

    const currentRankIndex = RANK_ORDER.indexOf(rank);
    if (currentRankIndex <= 0) return; // Rank não encontrado ou já é Ferro

    const rankInfo = RANK_XP_MAP[rank];

    // 2. Regra de XP: XP atual deve estar abaixo do limite mínimo do rank
    const xpLimiteInferior = rankInfo.anterior; 

    if (xp < xpLimiteInferior) {
        const newRank = RANK_ORDER[currentRankIndex - 1]; // Rank anterior
        
        try {
            // 3. Atualiza o MockAPI com o novo Rank
            const response = await axios.put(`${API_BASE_URL}/${id}`, {
                rank: newRank,
            });
            
            // 4. Atualiza o contexto global e notifica o usuário
            login(response.data);
            Alert.alert(
                "Atenção!", 
                `Seu rank foi rebaixado de ${rank} para ${newRank} devido à inatividade de ${daysInactive} dias e XP baixo.`,
                [{ text: "OK" }]
            );

        } catch (error) {
            console.error("Erro ao aplicar rebaixamento no MockAPI:", error);
        }
    }
};


// =========================================================================
// 3. Componente Principal
// =========================================================================

/**
 * @summary Tela principal do Dashboard (Perfil).
 * Exibe o progresso do usuário logado ou o perfil de outro usuário (vindo do Ranking).
 * Gerencia a lógica de rebaixamento e logout.
 */
export default function DashboardScreen({ route, navigation }) {
    const { user: loggedInUser, logout, login, getDaysSinceLastTraining } = useAuth(); 
    const [playerData, setPlayerData] = useState(null); // Dados do perfil sendo exibido
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * @summary Retorna o asset de imagem correto para a Sequência (Streak).
     */
    const getStreakIcon = (sequencia) => {
        if (!sequencia || sequencia === 0) {
            return iconFogo0; // Bola Cinza
        } else if (sequencia >= 1 && sequencia < 15) {
            return iconFogo1; // Fogo Laranja
        } else { // Sequência >= 15
            return iconFogo15; // Fogo Vermelho
        }
    };

    /**
     * @summary Hook principal de carregamento de dados.
     * Disparado quando a tela entra em foco (pela Tab ou navegação).
     * Decide se deve carregar o perfil próprio (e checar rebaixamento)
     * ou o perfil de terceiros (vindo do route.params.userId).
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            
            const userIdFromParams = route.params?.userId; 
            const userIdToDisplay = userIdFromParams || loggedInUser?.id;

            if (!userIdToDisplay) {
                setLoading(false);
                setError("Nenhum usuário para exibir.");
                return;
            }

            try {
                setPlayerData(null); 
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`${API_BASE_URL}/${userIdToDisplay}`);
                let updatedData = response.data;
                const isOwnProfile = String(response.data.id) === String(loggedInUser?.id);
                
                if (isOwnProfile) {
                    // Se for o perfil próprio, roda a lógica de rebaixamento
                    await checkRelegation(updatedData, getDaysSinceLastTraining, login);
                    
                    // Rebusca os dados APÓS a checagem (caso tenha sido rebaixado)
                    const recheckResponse = await axios.get(`${API_BASE_URL}/${userIdToDisplay}`);
                    updatedData = recheckResponse.data;
                    login(updatedData); // Atualiza o contexto
                }
                
                setPlayerData(updatedData); // Define o perfil a ser exibido

                // Limpa o parâmetro da rota (se existia)
                if (userIdFromParams) {
                    navigation.setParams({ userId: undefined });
                }

            } catch (err) {
                setError("Não foi possível carregar o perfil.");
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [navigation, loggedInUser?.id, login, route.params?.userId, getDaysSinceLastTraining]); 

    /**
     * @summary Processa o logout do usuário com confirmação.
     */
    const handleLogout = () => {
        const doLogout = () => {
            logout(); 
            // Reseta a navegação para a tela de Boas-Vindas
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Você tem certeza que deseja sair?")) doLogout();
        } else {
            Alert.alert(
                "Sair da conta", "Você tem certeza que deseja sair?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sair", style: "destructive", onPress: doLogout }
                ]
            );
        }
    };
    
    // Telas de Loading e Erro
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

    // Variáveis de renderização
    const isOwnProfile = String(playerData.id) === String(loggedInUser?.id);
    const rankInfo = RANK_XP_MAP[playerData.rank] || RANK_XP_MAP['Ferro'];
    const xpNoRankAtual = (playerData.xp || 0) - rankInfo.anterior;
    const xpTotalDoRank = rankInfo.proximo - rankInfo.anterior;
    const xpPercentage = (xpNoRankAtual / xpTotalDoRank) * 100;
    
    const rankIconKey = (playerData.rank || 'Ferro').toLowerCase() + '.png';
    const rankIconImg = rankIconImages[rankIconKey] || rankIconImages['ferro.png'];
    const avatarImg = avatarImages[playerData.avatar_filename] || avatarImages['avatar1.png'];
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
                                <Image source={iconEditar} style={styles.editIconImage} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Card de Rank e XP */}
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

                    {/* Cards de Estatísticas (Treinos e Sequência) */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Image source={iconCheckmark} style={styles.statIconImage} /> 
                            <Text style={styles.statLabel}>Treinos Concluídos: {playerData.treinos_concluidos}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Image source={getStreakIcon(playerData.sequencia)} style={styles.statIconImage} /> 
                            <Text style={styles.statLabel}>Sequência: {playerData.sequencia}</Text>
                        </View>
                    </View>

                    {/* Card de Conquistas */}
                    <View style={styles.card}>
                        <Text style={styles.conquistasTitle}>Conquistas</Text>
                        <View style={styles.conquistasGrid}>
                            {conquistasDoJogador.length > 0 ? (
                                conquistasDoJogador.map((key) => {
                                    const conquista = CONQUISTAS_MAP[key];
                                    if (!conquista) return null; // Ignora conquistas não mapeadas
                                    return (
                                        <View style={styles.conquistaItem} key={key}>
                                            <FontAwesome 
                                                name={conquista.icon} 
                                                size={40} 
                                                color={conquista.color}
                                                style={styles.conquistaIcon} 
                                            />
                                            <Text style={styles.conquistaText}>{conquista.titulo}</Text>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.conquistaEmpty}>Continue treinando para desbloquear conquistas!</Text>
                            )}
                        </View>
                    </View>

                    {/* Botão de Logout (Apenas no perfil próprio) */}
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

// =========================================================================
// 4. Estilos (Revertidos para StyleSheet)
// =========================================================================

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
    editIconImage: { 
        width: 24, 
        height: 24, 
        marginLeft: 10,
    },
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
    
    statIconImage: { 
        width: 40, 
        height: 40, 
        resizeMode: 'contain', 
        marginBottom: 5 
    },
    
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
        marginBottom: 5,
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