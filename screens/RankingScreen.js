import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { avatarImages } from './DashboardScreen'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora';

// Componente da Linha da Jogadora
const PlayerRow = ({ item, navigation }) => (
    // ==================================================
    // CORREÇÃO DO BUG "VISITAR PERFIL"
    // ==================================================
    // Precisamos especificar a Stack ('Dashboard'), a Tela ('ProfileDashboard')
    // e os parâmetros ('params')
    <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { 
            screen: 'ProfileDashboard', 
            params: { userId: item.id } 
        })}>
    {/* =============================================== */}
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
    const { user } = useAuth(); 

    useEffect(() => {
        // Roda a busca quando a tela entra em foco
        const unsubscribe = navigation.addListener('focus', async () => {
            if (!user || !user.rank) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const userRank = user.rank;
                // Busca jogadores COM O MESMO RANK, ordenados por XP
                const response = await axios.get(`${API_BASE_URL}?rank=${userRank}&sortBy=xp&order=desc`);
                
                let players = response.data;
                players = players.slice(0, 16); 
                
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

                // Meio da Tabela
                const relegationStartIndex = Math.max(3, totalPlayers - 3); 
                processedData.push(
                    ...players.slice(3, relegationStartIndex).map((p, i) => ({ 
                        ...p, 
                        type: 'player', 
                        rank_position: i + 4, 
                        avatar_img: avatarImages[p.avatar_filename] || avatarImages['ana.png']
                    }))
                );

                // Zona de Rebaixamento
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
        });

        return unsubscribe;
    }, [navigation, user]); // Depende do 'user' (objeto) e 'navigation'

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
                                <Text style={styles.emptyText}>Sua liga ainda está enchendo. Chame suas amigas!</Text>
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
    emptyText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        fontSize: 16,
    },
    header: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
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