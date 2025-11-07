import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 
import { FontAwesome } from '@expo/vector-icons'; // Usado para os ícones de Conquistas

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// =========================================================================
// 1. Mapeamento de Assets e Constantes
// =========================================================================

// Mapeamento de Avatares (mantido)
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

// Importação dos Novos Ícones (AJUSTE O CAMINHO SE NECESSÁRIO)
const iconEditar = require('../assets/icons/editar.png');
const iconCheckmark = require('../assets/icons/treino.png'); // Treinos Concluídos
const iconFogo0 = require('../assets/icons/fogo0.png');           // Sem Sequência / Bola Cinza
const iconFogo1 = require('../assets/icons/fogo1.png');           // Sequência 1-14
const iconFogo15 = require('../assets/icons/fogo15.png');         // Sequência 15+

// Ordem Canônica dos Ranks
const RANK_ORDER = [
    'Ferro', 'Bronze', 'Prata', 'Ouro', 'Rubi', 'Ametista', 'Safira', 'Diamante'
];

// Mapa de XP e Limites para Promoção/Rebaixamento
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

// Mapeamento de Conquistas (FontAwesome como substituto visual dos Emojis)
const CONQUISTAS_MAP = {
    'treino_1': { icon: 'star', color: '#FFD700', titulo: 'Primeiro Treino' },
    'treino_10': { icon: 'trophy', color: '#FFD700', titulo: '10 Treinos Concluídos' },
    'sequencia_3': { icon: 'fire', color: '#FF4500', titulo: '3 Dias de Foco' },
    'rank_up_1': { icon: 'level-up', color: '#00FFC2', titulo: 'Primeira Promoção' },
    'rank_up_3': { icon: 'rocket', color: '#00FFC2', titulo: 'Impulso na Carreira' },
};


// =========================================================================
// 2. Lógica de Rebaixamento
// =========================================================================

const checkRelegation = async (currentUser, getDaysSinceLastTraining, login) => {
    const { id, xp, rank } = currentUser;
    
    // Regra de Inatividade Mínima: 7 dias
    const INACTIVITY_THRESHOLD_DAYS = 7; 
    const daysInactive = getDaysSinceLastTraining();

    // 1. Não rebaixa se for Ferro ou se estiver ativo (menos de 7 dias)
    if (rank === 'Ferro' || daysInactive < INACTIVITY_THRESHOLD_DAYS) {
        return; 
    }

    const currentRankIndex = RANK_ORDER.indexOf(rank);
    
    if (currentRankIndex <= 0) return; 

    const rankInfo = RANK_XP_MAP[rank];

    // 2. Regra de XP: XP abaixo do limite inferior do Rank
    const xpLimiteInferior = rankInfo.anterior; 

    if (xp < xpLimiteInferior) {
        const newRank = RANK_ORDER[currentRankIndex - 1]; // Rank anterior
        
        console.log(`[REBAIXAMENTO] Jogadora ${id} rebaixada de ${rank} para ${newRank} (XP: ${xp} < ${xpLimiteInferior})`);
        
        try {
            // 3. Atualiza o MockAPI com o novo Rank
            const response = await axios.put(`${API_BASE_URL}/${id}`, {
                rank: newRank,
            });
            
            // 4. Atualiza o contexto (logar o novo usuário/perfil)
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

export default function DashboardScreen({ route, navigation }) {
    const { user: loggedInUser, logout, login, getDaysSinceLastTraining } = useAuth(); 
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Lógica para o ícone de Sequência (Bola de Fogo)
    const getStreakIcon = (sequencia) => {
        if (!sequencia || sequencia === 0) {
            return iconFogo0; // Bola Cinza/Sem Fogo
        } else if (sequencia >= 1 && sequencia < 15) {
            return iconFogo1; // Fogo Laranja (1 a 14 dias)
        } else { // Sequência >= 15
            return iconFogo15; // Fogo Vermelho (15+ dias)
        }
    };


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            
            // 1. Armazena o ID vindo dos parâmetros (se houver, vindo do Ranking)
            const userIdFromParams = route.params?.userId; 
            
            // 2. Determina o ID a ser exibido: prioriza o da rota, senão usa o logado.
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
                
                // Busca os dados mais recentes do perfil na API
                const response = await axios.get(`${API_BASE_URL}/${userIdToDisplay}`);
                let updatedData = response.data;

                // Identifica se é o perfil da jogadora logada.
                const isOwnProfile = String(response.data.id) === String(loggedInUser?.id);
                
                if (isOwnProfile) {
                    // Executa a checagem de rebaixamento (apenas para o próprio perfil)
                    await checkRelegation(updatedData, getDaysSinceLastTraining, login);
                    
                    // Rebusca os dados APÓS a checagem para garantir o estado final
                    const recheckResponse = await axios.get(`${API_BASE_URL}/${userIdToDisplay}`);
                    updatedData = recheckResponse.data;
                    login(updatedData); // Garante que o estado de contexto está atualizado
                }
                
                setPlayerData(updatedData); // Exibe o perfil (próprio ou de terceiros)

                // Limpeza de Parâmetros da Rota: 
                // Essencial para garantir que clicar na Tab 'Dashboard' volte ao próprio perfil.
                if (userIdFromParams) {
                    navigation.setParams({ userId: undefined });
                }


            } catch (err) {
                setError("Não foi possível carregar o perfil.");
                console.error("Erro ao buscar da API (MockAPI) com check de rebaixamento:", err);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [navigation, loggedInUser?.id, login, route.params?.userId, getDaysSinceLastTraining]); 


    const handleLogout = () => {
        const doLogout = () => {
            logout(); 
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
                    { text: "Sair", style: "destructive", onPress: doLogout }
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
    
    // Converte o nome do rank para minúsculo para buscar o asset
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
            <           Text style={styles.name}>{playerData.nome}</Text>
            
                        {isOwnProfile && (
                            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                                {/* SUBSTITUI O EMOJI PELA IMAGEM IMPORTADA */}
                                <Image source={iconEditar} style={styles.editIconImage} />
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
                        {/* BOX 1: TREINOS CONCLUÍDOS (Ícone Customizado) */}
                        <View style={styles.statBox}>
                            <Image source={iconCheckmark} style={styles.statIconImage} /> 
                            <Text style={styles.statLabel}>Treinos Concluídos: {playerData.treinos_concluidos}</Text>
                        </View>

                        {/* BOX 2: SEQUÊNCIA (Lógica Bola de Fogo) */}
                        <View style={styles.statBox}>
                            <Image source={getStreakIcon(playerData.sequencia)} style={styles.statIconImage} /> 
                            <Text style={styles.statLabel}>Sequência: {playerData.sequencia}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.conquistasTitle}>Conquistas</Text>
                        <View style={styles.conquistasGrid}>
                            {conquistasDoJogador.length > 0 ? (
                                conquistasDoJogador.map((key) => {
                                    const conquista = CONQUISTAS_MAP[key];
                                    return (
                                        <View style={styles.conquistaItem} key={key}>
                                            <FontAwesome 
                                                name={conquista?.icon || 'question-circle'} 
                                                size={40} 
                                                color={conquista?.color || 'white'}
                                                style={styles.conquistaIcon} 
                                            />
                                            <Text style={styles.conquistaText}>{conquista?.titulo || key}</Text>
                                        </View>
                                    );
                                })
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

// =========================================================================
// 4. Estilos
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
    
    // NOVO ESTILO PARA IMAGEM/ICON (Sequência e Treinos Concluídos)
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
        // Estilos FontAwesome
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