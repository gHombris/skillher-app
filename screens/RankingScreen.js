import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 1. Importar useAuth
import { avatarImages } from './DashboardScreen'; // Importar mapa de avatares

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora';

// Componente da Linha da Jogadora
const PlayerRow = ({ item, navigation }) => (
    // Passa o 'item.id' para a rota do Dashboard
    <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { userId: item.id })}>
        <View style={styles.playerRow}>
            <Text style={styles.playerRank}>{item.rank_position}</Text>
            <Image source={item.avatar_img} style={styles.playerAvatar} />
            <Text style={styles.playerName}>{item.nome}</Text>
            <Text style={styles.playerXP}>{item.xp}XP</Text>
        </View>
    </TouchableOpacity>
);

// Componente da Zona
const ZoneDivider = ({ title, icon }) => (
    <View style={styles.zoneContainer}>
        <Text style={styles.zoneIcon}>{icon}</Text>
        <Text style={styles.zoneText}>{title}</Text>
        <Text style={styles.zoneIcon}>{icon}</Text>
    </View>
);

export default function RankingScreen({ navigation }) {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // 2. Pegar o usuário logado do contexto

    useEffect(() => {
        // 3. Não busca se o usuário não estiver carregado
        if (!user || !user.rank) {
            setLoading(false);
            return;
        }

        const fetchRanking = async () => {
            try {
                setLoading(true);
                
                // 4. CORREÇÃO REQUISITO 2: Filtra a API pelo rank do usuário
                const userRank = user.rank;
                const response = await axios.get(`${API_BASE_URL}?rank=${userRank}&sortBy=xp&order=desc`);
                
                let players = response.data;
                
                // Limita a 16 jogadores (como no Duolingo)
                players = players.slice(0, 16); 
                
                // 5. LÓGICA DE ZONAS DINÂMICA (Top 3 = Promoção, 3 Últimos = Rebaixamento)
                const totalPlayers = players.length;
                const processedData = [];

                // Zona de Promoção (Top 3)
                processedData.push(
                    ...players.slice(0, 3).map((p, i) => ({ 
                        ...p, 
                        type: 'player', 
                        rank_position: i + 1, 
                        avatar_img: avatarImages[p.avatar_filename] || avatarImages['ana.png']
                    }))
                );
                processedData.push({ id: 'promo_divider', type: 'zone', title: 'Zona promoção', icon: '⬆️' });

                // Meio da Tabela (Posição 4 até antepenúltimo)
                const relegationStartIndex = Math.max(3, totalPlayers - 3); // Garante que não sobreponha
                processedData.push(
                    ...players.slice(3, relegationStartIndex).map((p, i) => ({ 
                        ...p, 
                        type: 'player', 
                        rank_position: i + 4, 
                        avatar_img: avatarImages[p.avatar_filename] || avatarImages['ana.png']
                    }))
                );

                // Zona de Rebaixamento (Últimos 3, se houver mais de 3 jogadores)
                if (totalPlayers > 3) {
                    processedData.push({ id: 'rebaixamento_divider', type: 'zone', title: 'Zona rebaixamento', icon: '⬇️' });
                    processedData.push(
                        ...players.slice(relegationStartIndex).map((p, i) => ({ 
                            ...p, 
                            type: 'player', 
                            rank_position: i + relegationStartIndex + 1, 
                            avatar_img: avatarImages[p.avatar_filename] || avatarImages['ana.png']
                        }))
                    );
                }

                setRankingData(processedData);
            } catch (error) {
                console.error("Erro ao buscar ranking:", error);
            } finally {
                setLoading(false);
            }
        };
        // 6. Roda a busca quando o rank do usuário mudar
        fetchRanking();
    }, [user]); // Depende do objeto 'user'

    const renderItem = ({ item }) => {
        if (item.type === 'zone') {
            return <ZoneDivider title={item.title} icon={item.icon} />;
        }
        return <PlayerRow item={item} navigation={navigation} />;
    };

    if (loading) {
         return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </LinearGradient>
        );
    }
    
    // Mensagem se o usuário não estiver carregado
    if (!user) {
         return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <Text style={styles.errorText}>Carregando dados do usuário...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    {/* Título dinâmico baseado no Rank */}
                    <Text style={styles.headerTitle}>Ranking Semanal (Liga {user.rank})</Text>
                </View>

                <View style={styles.card}>
                    <FlatList
                        data={rankingData} 
                        renderItem={renderItem}
                        keyExtractor={item => String(item.id)}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={
                            <View>
                                <Text style={styles.emptyText}>Nenhum jogador encontrado neste rank.</Text>
                            </View>
                        }
                    />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, padding: 20 },
    loadingContainer: { // Adicionado para telas de loading/erro
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: { // Adicionado
        color: 'white', 
        fontSize: 16, 
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    emptyText: { // Adicionado
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    header: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
    card: { flex: 1, backgroundColor: 'rgba(30, 0, 50, 0.6)', borderRadius: 15, padding: 15 },
    
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    playerRank: { color: 'white', fontSize: 16, fontWeight: 'bold', width: 30 },
    playerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
    playerName: { flex: 1, color: 'white', fontSize: 16 },
    playerXP: { color: '#00FFC2', fontSize: 16, fontWeight: 'bold' },
    
    zoneContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10 },
    zoneText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 'bold' },
    zoneIcon: { fontSize: 18 },

    separator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 10 }
});