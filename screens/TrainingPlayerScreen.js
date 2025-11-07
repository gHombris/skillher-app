import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import XPFeedbackModal from '../components/XPFeedbackModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// Lógica de Ranks (para o MockAPI)
const RANK_XP_MAP = {
    'Ferro': { proximo: 50 },
    'Bronze': { proximo: 100 },
    'Prata': { proximo: 200 },
    'Ouro': { proximo: 400 },
    'Rubi': { proximo: 800 },
    'Ametista': { proximo: 1500 },
    'Safira': { proximo: 2500 },
    'Diamante': { proximo: 9999 },
    // Fallbacks
    'rank 1': { proximo: 50 },
    'rank 2': { proximo: 100 },
    'rank 3': { proximo: 100 },
    'rank 4': { proximo: 50 },
    'rank 5': { proximo: 50 },
};

// <<< Lógica de checagem de Ranks e Conquistas (Frontend) >>>
const checkProgresso = (currentUser, xpGanhos) => {
    const novoXp = (currentUser.xp || 0) + xpGanhos;
    const novosTreinos = (currentUser.treinos_concluidos || 0) + 1;
    
    // 1. Checa Ranks
    let novoRank = currentUser.rank;
    const rankAtualInfo = RANK_XP_MAP[currentUser.rank] || RANK_XP_MAP['Ferro'];
    
    // Verifica se o rank atual existe no mapa, se não, usa Ferro
    const currentRankKey = RANK_XP_MAP[currentUser.rank] ? currentUser.rank : 'Ferro';
    const indexAtual = Object.keys(RANK_XP_MAP).indexOf(currentRankKey);

    if (novoXp >= rankAtualInfo.proximo && indexAtual < Object.keys(RANK_XP_MAP).length - 1) {
        novoRank = Object.keys(RANK_XP_MAP)[indexAtual + 1];
    }

    // 2. Checa Conquistas
    let conquistas = Array.isArray(currentUser.conquistas) ? [...currentUser.conquistas] : [];
    
    if (novosTreinos >= 1 && !conquistas.includes('treino_1')) {
        conquistas.push('treino_1');
        Alert.alert("Conquista Desbloqueada!", "Primeiro Treino Concluído!");
    }
    if (novosTreinos >= 10 && !conquistas.includes('treino_10')) {
        conquistas.push('treino_10');
        Alert.alert("Conquista Desbloqueada!", "10 Treinos Concluídos! Continue assim!");
    }
    
    // ==================================================
    // CORREÇÃO LÓGICA DE SEQUÊNCIA
    // ==================================================
    const novaSequencia = (currentUser.sequencia || 0) + 1;
    // (Ainda não temos a lógica de data, então apenas incrementamos)
    // ==================================================


    return {
        xp: novoXp,
        treinos_concluidos: novosTreinos,
        rank: novoRank,
        conquistas: conquistas,
        sequencia: novaSequencia, // <<< USA A NOVA SEQUÊNCIA
    };
};


const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function TrainingPlayerScreen({ route, navigation }) {
    const { exercise } = route.params;
    const videoRef = useRef(null); 
    const [seconds, setSeconds] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const intervalRef = useRef(null);
    const { user, login } = useAuth();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleCompleteTraining = () => {
        clearInterval(intervalRef.current);
        setModalVisible(true);
    };

    const handleCloseModal = async () => {
        setModalVisible(false);
        const xpGanhos = 10; 

        if (!user) {
            console.error("Usuário não logado, não é possível salvar o progresso.");
            navigation.goBack();
            return;
        }

        try {
            // 1. Calcula todo o progresso (XP, Ranks, Conquistas, Sequencia)
            const progressoAtualizado = checkProgresso(user, xpGanhos);

            // 2. Envia os dados atualizados para o MockAPI
            const response = await axios.put(`${API_BASE_URL}/${user.id}`, progressoAtualizado);
            
            // 3. Atualiza o usuário no contexto global
            login(response.data);
            console.log("Progresso salvo (MockAPI):", response.data);

        } catch (error) {
            console.error("Erro ao salvar progresso (MockAPI):", error);
            Alert.alert("Erro", "Não foi possível salvar seu progresso.");
        }
        
        navigation.goBack();
    };

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Voltar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{exercise.title}</Text>
                    <Text style={styles.difficulty}>{exercise.difficulty}</Text>

                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={exercise.videoPath} 
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                    />

                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>Tempo de Treino: {formatTime(seconds)}</Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={handleCompleteTraining}
                    >
                        <Text style={styles.completeButtonText}>Marcar como Concluído</Text>
                    </TouchableOpacity>
                </View>

                <XPFeedbackModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                    xp={10}
                    time={formatTime(seconds)}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    video: {
        width: '100%',
        height: 220, 
        borderRadius: 15,
        backgroundColor: 'black', 
    },
    header: { padding: 20 },
    backButton: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, paddingHorizontal: 20 },
    title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    difficulty: { color: '#00FFC2', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    timerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    timerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    completeButton: {
        backgroundColor: '#00FFC2',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    completeButtonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
});