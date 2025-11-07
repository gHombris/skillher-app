import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { avatarImages } from './DashboardScreen'; // Importa o mapa de avatares
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // <<< MOCKAPI

const PlayerRow = ({ item, navigation }) => (
    // CORRIGIDO: Navegação aninhada para funcionar
    <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { screen: 'ProfileDashboard', params: { userId: item.id } })}>
        <View style={styles.playerRow}>
            <Text style={styles.playerRank}>{item.rankNum}</Text>
            <Image source={item.avatar_img} style={styles.playerAvatar} />
            <Text style={styles.playerName}>{item.nome}</Text>
            <Text style={styles.playerXP}>{item.xp}XP</Text>
        </View>
    </TouchableOpacity>
);

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
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchRanking = async () => {
            try {
                setLoading(true);
                // LÓGICA MUDADA (GET com filtros do MockAPI)
                const response = await axios.get(API_BASE_URL, {
                    params: {
                        rank: user.rank,   // Filtra pelo rank
                        limit: 16,         // Limita a 16
                        sortBy: 'xp',      // Ordena por XP
                        order: 'desc'      // Ordem descendente
                    }
                });
                
                const players = response.data;

                // Lógica das zonas (Top 4 promoção, 4-12 neutro, 12-16 rebaixamento)
                const processedData = [
                    ...players.slice(0, 4).map((p, i) => ({ ...p, type: 'player', rankNum: i + 1, avatar_img: avatarImages[p.avatar_filename] })),
                    { id: 'promo_divider', type: 'zone', title: 'Zona promoção', icon: '⬆️' },
                    ...players.slice(4, 12).map((p, i) => ({ ...p, type: 'player', rankNum: i + 5, avatar_img: avatarImages[p.avatar_filename] })),
                    { id: 'rebaixamento_divider', type: 'zone', title: 'Zona rebaixamento', icon: '⬇️' },
                    ...players.slice(12, 16).map((p, i) => ({ ...p, type: 'player', rankNum: i + 13, avatar_img: avatarImages[p.avatar_filename] })),
                ];
                
                setRankingData(processedData);

            } catch (error) {
                console.error("Erro ao buscar ranking (MockAPI):", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRanking();
    }, [user]); 

    const renderItem = ({ item }) => {
        if (item.type === 'zone') {
            return <ZoneDivider title={item.title} icon={item.icon} />;
        }
        return <PlayerRow item={item} navigation={navigation} />;
    };

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Ranking Semanal</Text>
                    {user && <Text style={styles.rankSubtitle}>Visualizando Rank: {user.rank}</Text>}
                </View>

                <View style={styles.card}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#00FFC2" style={{marginTop: 20}} />
                    ) : (
                        <FlatList
                            data={rankingData}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Nenhuma jogadora encontrada neste rank.</Text>
                            }
                        />
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
    rankSubtitle: { color: '#00FFC2', fontSize: 16, marginTop: 5 }, 
    card: { flex: 1, backgroundColor: 'rgba(30, 0, 50, 0.6)', borderRadius: 15, padding: 15 },
    
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    playerRank: { color: 'white', fontSize: 16, fontWeight: 'bold', width: 30 },
    playerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
    playerName: { flex: 1, color: 'white', fontSize: 16 },
    playerXP: { color: '#00FFC2', fontSize: 16, fontWeight: 'bold' },
    
    zoneContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10 },
    zoneText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 'bold' },
    zoneIcon: { fontSize: 18 },

    separator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 10 },
    emptyText: { color: 'white', textAlign: 'center', marginTop: 30, fontSize: 16, fontStyle: 'italic' }
});