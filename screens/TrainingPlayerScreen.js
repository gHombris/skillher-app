import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import XPFeedbackModal from '../components/XPFeedbackModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// <<< NOVO: MAPA CANÔNICO E ORDEM DE RANKS PARA CONSISTÊNCIA >>>
const RANK_ORDER = [
    'Ferro', 'Bronze', 'Prata', 'Ouro', 'Rubi', 'Ametista', 'Safira', 'Diamante'
];

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
const CONQUISTAS_MAP = {
    'treino_1': { icon: 'star', color: '#FFD700', titulo: 'Primeiro Treino' },
    'treino_10': { icon: 'trophy', color: '#FFD700', titulo: '10 Treinos Concluídos' },
    'sequencia_3': { icon: 'fire', color: '#FF4500', titulo: '3 Dias de Foco' },
    'sequencia_7': { icon: 'certificate', color: '#FF4500', titulo: 'Sequência Semanal' },
    'rank_up_1': { icon: 'level-up', color: '#00FFC2', titulo: 'Primeira Promoção' },
    'rank_up_3': { icon: 'rocket', color: '#00FFC2', titulo: 'Impulso na Carreira' },
    'rank_top_3': { icon: 'medal', color: '#C0C0C0', titulo: 'Top 3 Semanal' },
};

// <<< ATUALIZADO: Lógica de checagem de Ranks, Conquistas e Sequência >>>
const checkProgresso = (currentUser, xpGanhos, lastTrainingDate) => {
    const novoXp = (currentUser.xp || 0) + xpGanhos;
    const novosTreinos = (currentUser.treinos_concluidos || 0) + 1;
    let novoRank = currentUser.rank;
    
    const previousRank = currentUser.rank; 
    let isRankUp = false;
    
    const currentRankKey = RANK_ORDER.includes(currentUser.rank) ? currentUser.rank : 'Ferro';
    const rankAtualInfo = RANK_XP_MAP[currentRankKey];
    const indexAtual = RANK_ORDER.indexOf(currentRankKey);

    // 1. Checa Ranks (Promoção)
    if (rankAtualInfo && novoXp >= rankAtualInfo.proximo && indexAtual < RANK_ORDER.length - 1) {
        novoRank = RANK_ORDER[indexAtual + 1]; 
        isRankUp = true; 
        Alert.alert("PARABÉNS!", `Você foi promovida para o Rank ${novoRank}!`);
    }

    // 2. Lógica de Sequência Diária e Treino Concluído
    let novaSequencia = currentUser.sequencia || 0;
    const today = new Date().toDateString();
    
    if (lastTrainingDate !== today) {
        novaSequencia++;
    }

    // 3. Checa Conquistas (ATUALIZADO SEM as conquistas removidas)
    let conquistas = Array.isArray(currentUser.conquistas) ? [...currentUser.conquistas] : [];
    
    const checkAndAddConquista = (key, title) => {
        if (!conquistas.includes(key)) {
            conquistas.push(key);
            Alert.alert("Conquista Desbloqueada!", title);
        }
    }
    
    // Conquistas de Treino
    if (novosTreinos >= 1) checkAndAddConquista('treino_1', "Primeiro Treino Concluído!");
    // if (novosTreinos >= 10) checkAndAddConquista('treino_10', "10 Treinos Concluídos! Continue assim!"); // REMOVIDO
    
    // Conquistas de Sequência
    if (novaSequencia >= 3) checkAndAddConquista('sequencia_3', "3 Dias de Foco: Não perca o ritmo!");
    if (novaSequencia >= 7) checkAndAddConquista('sequencia_7', "Sequência Semanal: Sua consistência é um diferencial!");
    // if (novaSequencia >= 10) checkAndAddConquista('sequencia_10', "10 Dias de Fogo: Você está pegando fogo!"); // REMOVIDO

    // Conquistas de Rank 
    if (isRankUp) {
        checkAndAddConquista('rank_up_1', `Primeira Promoção: Bem-vinda ao Rank ${novoRank}!`);
        const newRankIndex = RANK_ORDER.indexOf(novoRank);
        if (newRankIndex >= RANK_ORDER.indexOf('Prata')) { 
            checkAndAddConquista('rank_up_3', "Impulso na Carreira: Você está subindo rápido!");
        }
    }

    return {
        xp: novoXp,
        treinos_concluidos: novosTreinos,
        rank: novoRank,
        conquistas: conquistas,
        sequencia: novaSequencia, 
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
    const { user, login, updateStreak, getLastTrainingDate } = useAuth();

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
            // 2. PEGAR A ÚLTIMA DATA DE TREINO
            const lastTrainingDate = getLastTrainingDate();
            
            // 3. CALCULAR O PROGRESSO
            const progressoAtualizado = checkProgresso(user, xpGanhos, lastTrainingDate);

            // 4. Envia os dados atualizados para o MockAPI
            const response = await axios.put(`${API_BASE_URL}/${user.id}`, progressoAtualizado);
            
            // 5. Atualiza o usuário no contexto global
            login(response.data);
            
            // 6. SALVA A DATA DE HOJE NO LOCALSTORAGE
            if (lastTrainingDate !== new Date().toDateString()) {
                updateStreak();
            }
            
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

// Estilos (idênticos ao que você mandou)
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