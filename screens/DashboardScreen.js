import React, { useState, useEffect } from 'react'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// O mock de dados 
const LOGGED_IN_USER_ID = '8';
const ALL_PLAYERS = {
    '1': { id: '1', nome: "Emilly", xp: 80, avatar: require('../assets/avatares/emilly.png'), rank: 'Bronze', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 200, treinos_concluidos: 12, sequencia: 5 },
    '2': { id: '2', nome: "Ana", xp: 50, avatar: require('../assets/avatares/ana.png'), rank: 'Bronze', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 200, treinos_concluidos: 8, sequencia: 3 },
    '3': { id: '3', nome: "Maria", xp: 45, avatar: require('../assets/avatares/maria.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 7, sequencia: 2 },
    '4': { id: '4', nome: "Tatiana", xp: 35, avatar: require('../assets/avatares/tatiana.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 5, sequencia: 1 },
    '5': { id: '5', nome: "Ester", xp: 35, avatar: require('../assets/avatares/ester.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 4, sequencia: 0 },
    '6': { id: '6', nome: "Andreia", xp: 30, avatar: require('../assets/avatares/andreia.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 3, sequencia: 0 },
    '7': { id: '7', nome: "Monique", xp: 15, avatar: require('../assets/avatares/monique.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 1, sequencia: 1 },
    '8': { id: '8', nome: "Luana Pereira", xp: 10, avatar: require('../assets/avatares/marta-futebol-brasil.png'), rank: 'Ferro', rank_icon_id: require('../assets/ranks/ferro.png'), xp_para_proximo_rank: 100, treinos_concluidos: 0, sequencia: 0 }
};


export default function DashboardScreen({ route }) {
    
   
    const [playerData, setPlayerData] = useState(null);

    
    useEffect(() => {
        const userIdToDisplay = route.params?.userId || LOGGED_IN_USER_ID;
        const jogadora = ALL_PLAYERS[userIdToDisplay];
        setPlayerData(jogadora);
    }, [route.params?.userId]); 

    // Se os dados ainda não carregaram, mostramos uma tela de "carregando"
    if (!playerData) {
        return (
            <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </LinearGradient>
        );
    }

    const isOwnProfile = playerData.id === LOGGED_IN_USER_ID;
    const xpPercentage = (playerData.xp / playerData.xp_para_proximo_rank) * 100;
    
    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={{flex:1}}>
            <SafeAreaView style={{flex:1}}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    
                    <Text style={styles.headerTitle}>{isOwnProfile ? "Bem-vinda de volta!" : `Perfil de ${playerData.nome}`}</Text>

                    
                    <Image source={playerData.avatar} style={styles.avatar} /> 
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{playerData.nome}</Text>
                        
                       
                        {isOwnProfile && <Text style={styles.editIcon}>✏️</Text>}
                    </View>

                    <View style={styles.card}>
                        <View style={styles.rankInfo}>
                            
                            <Image source={playerData.rank_icon_id} style={styles.rankIcon} />
                            <View style={styles.rankTextContainer}>
                                <Text style={styles.rankText}>Rank: {playerData.rank}</Text>
                                <Text style={styles.xpText}>{playerData.xp}XP</Text>
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