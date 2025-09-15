import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// --- NOSSOS DADOS MOCK ---
// No futuro, isso virá da nossa API Python
const jogadora = {
    nome: "Luana Pereira",
    avatar_id: require('../assets/marta-futebol-brasil.png'), 
    rank: "Ferro",
    rank_icon_id: require('../assets/ranks/rank_ferro.png'), // Caminho para o ícone do rank
    xp: 10,
    xp_para_proximo_rank: 100,
    treinos_concluidos: 0,
    sequencia: 0,
};
// -------------------------

export default function DashboardScreen({ navigation }) {
    const xpPercentage = (jogadora.xp / jogadora.xp_para_proximo_rank) * 100;

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>Bem-vinda de volta!</Text>

                    <Image source={jogadora.avatar_id} style={styles.avatar} />
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{jogadora.nome}</Text>
                        <Text style={styles.editIcon}>✏️</Text>
                    </View>

                    {/* Card de Rank */}
                    <View style={styles.card}>
                        <View style={styles.rankInfo}>
                            <Image source={jogadora.rank_icon_id} style={styles.rankIcon} />
                            <View style={styles.rankTextContainer}>
                                <Text style={styles.rankText}>Rank: {jogadora.rank}</Text>
                                <Text style={styles.xpText}>{jogadora.xp}XP</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${xpPercentage}%` }]} />
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statIcon}>👟</Text>
                            <Text style={styles.statLabel}>Treinos Concluídos: {jogadora.treinos_concluidos}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statIcon}>🔥</Text>
                            <Text style={styles.statLabel}>Sequência: {jogadora.sequencia}</Text>
                        </View>
                    </View>

                    {/* Conquistas */}
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.conquistasTitle}>Conquistas</Text>
                    </TouchableOpacity>
                </ScrollView>
                
                {/* Rodapé de Navegação */}
                <View style={styles.footerNav}>
                    <TouchableOpacity style={styles.footerButtonActive}>
                        <Text style={styles.footerButtonTextActive}>Perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.footerButton}
                        onPress={() => navigation.navigate('Ranking')}
                    >
                        <Text style={styles.footerButtonText}>Ranking</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: { alignItems: 'center', padding: 20 },
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
    footerNav: { flexDirection: 'row', padding: 10, backgroundColor: 'rgba(30, 0, 50, 0.8)' },
    footerButton: { flex: 1, paddingVertical: 10, borderRadius: 20 },
    footerButtonActive: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#00FFC2' },
    footerButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
    footerButtonTextActive: { color: 'black', textAlign: 'center', fontWeight: 'bold' }
});