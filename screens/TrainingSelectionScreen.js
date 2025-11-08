import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Estrutura de dados local para os treinos
const categories = [
    { id: 'chute', title: 'Chute' },
    { id: 'drible', title: 'Drible' },
    { id: 'passe', title: 'Passe' },
    { id: 'defesa', title: 'Defesa' },
];

const exercises = {
    chute: [
        { id: 'c1', title: 'Chute Rasteiro de Precisão', difficulty: 'Iniciante', videoPath: require('../assets/videos/chute_rasteiro.mp4') }
    ],
    drible: [
        { id: 'd1', title: 'Controle de Bola Básico', difficulty: 'Iniciante', videoPath: require('../assets/videos/controle_bola.mp4') }
    ],
    passe: [
        { id: 'p1', title: 'Passe de Chapa (Curto)', difficulty: 'Iniciante', videoPath: require('../assets/videos/passe_chapa.mp4') }
    ],
    defesa: [],
};

/**
 * @summary Tela de Seleção de Treinos.
 * Permite ao usuário filtrar treinos por categoria (Chute, Drible, etc.)
 * e selecionar um exercício para iniciar.
 */
export default function TrainingSelectionScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState(categories[0].id);

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Escolha seu Treino</Text>
                </View>

                {/* Seletor de Categorias Horizontal (CSS Grid/Flex Intent) */}
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category.id && styles.categoryButtonActive
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Text 
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.categoryTextActive
                                    ]}
                                >
                                    {category.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Lista de Exercícios (Filtrada) */}
                <FlatList
                    data={exercises[selectedCategory]}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.exerciseList}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.exerciseCard}
                            onPress={() => navigation.navigate('TrainingPlayer', { exercise: item })}
                        >
                            <View>
                                <Text style={styles.exerciseTitle}>{item.title}</Text>
                                <Text style={styles.exerciseDifficulty}>{item.difficulty}</Text>
                            </View>
                            <Text style={styles.playIcon}>▶</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum treino disponível nesta categoria ainda.</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

// Estilos (Restaurados para corrigir o layout)
const styles = StyleSheet.create({
    header: { padding: 20, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
    categoryContainer: { paddingLeft: 20, marginBottom: 20, height: 50 },
    categoryButton: { 
        backgroundColor: 'rgba(30, 0, 50, 0.6)', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 20, 
        marginRight: 10, 
        justifyContent: 'center',
        height: 40, // Altura fixa para alinhar
    },
    categoryButtonActive: { 
        backgroundColor: '#00FFC2' 
    },
    categoryText: { 
        color: 'white', 
        fontWeight: 'bold' 
    },
    categoryTextActive: {
        color: 'black'
    },
    exerciseList: { paddingHorizontal: 20 },
    exerciseCard: { 
        backgroundColor: 'rgba(30, 0, 50, 0.6)', 
        borderRadius: 15, 
        padding: 20, 
        marginBottom: 15, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    exerciseTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    exerciseDifficulty: { color: '#00FFC2', fontSize: 14, marginTop: 5 },
    playIcon: { color: 'white', fontSize: 24 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: 'white', fontSize: 16, fontStyle: 'italic' }
});