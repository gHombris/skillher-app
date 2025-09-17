import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const players = [
    { id: '1', nome: "Emilly", xp: 80, avatar: require('../assets/avatares/emilly.png') },
    { id: '2', nome: "Ana", xp: 50, avatar: require('../assets/avatares/ana.png') },
    { id: '3', nome: "Maria", xp: 45, avatar: require('../assets/avatares/maria.png') },
    { id: '4', nome: "Tatiana", xp: 35, avatar: require('../assets/avatares/tatiana.png') },
    { id: '5', nome: "Ester", xp: 35, avatar: require('../assets/avatares/ester.png') },
    { id: '6', nome: "Andreia", xp: 30, avatar: require('../assets/avatares/andreia.png') },
    { id: '7', nome: "Monique", xp: 15, avatar: require('../assets/avatares/monique.png') },
    { id: '8', nome: "Luana Pereira", xp: 10, avatar: require('../assets/avatares/luana.png') }
];


const rankingDataWithZones = [
    ...players.slice(0, 6).map((p, i) => ({ ...p, type: 'player', rank: i + 1 })),
    { id: 'promo_divider', type: 'zone', title: 'Zona promoção', icon: '⬆️' },
    ...players.slice(6, 8).map((p, i) => ({ ...p, type: 'player', rank: i + 7 })),
    { id: 'rebaixamento_divider', type: 'zone', title: 'Zona rebaixamento', icon: '⬇️' }
];


const PlayerRow = ({ item, navigation }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { userId: item.id })}>
        <View style={styles.playerRow}>
            <Text style={styles.playerRank}>{item.rank}</Text>
            <Image source={item.avatar} style={styles.playerAvatar} />
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
                </View>

                <View style={styles.card}>
                    <FlatList
                        data={rankingDataWithZones}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    header: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
    card: { flex: 1, backgroundColor: 'rgba(30, 0, 50, 0.6)', borderRadius: 15, padding: 15 },
    
    // Estilos da linha da jogadora
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    playerRank: { color: 'white', fontSize: 16, fontWeight: 'bold', width: 30 },
    playerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
    playerName: { flex: 1, color: 'white', fontSize: 16 },
    playerXP: { color: '#00FFC2', fontSize: 16, fontWeight: 'bold' },
    
    // Estilos do divisor de zona
    zoneContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10 },
    zoneText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 'bold' },
    zoneIcon: { fontSize: 18 },

    separator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 10 }
});