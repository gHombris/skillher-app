import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native'; // Adicionado ScrollView
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import XPFeedbackModal from '../components/XPFeedbackModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // API Mockada

// =========================================================================
// Lógica de Gamificação (Promoção, Sequência, Conquistas)
// =========================================================================
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
    'sequencia_3': { icon: 'fire', color: '#FF4500', titulo: '3 Dias de Foco' },
    'sequencia_7': { icon: 'certificate', color: '#FF4500', titulo: 'Sequência Semanal' },
    'rank_up_1': { icon: 'level-up', color: '#00FFC2', titulo: 'Primeira Promoção' },
    'rank_up_3': { icon: 'rocket', color: '#00FFC2', titulo: 'Impulso na Carreira' },
};

/**
 * @summary Calcula o novo estado da jogadora após um treino.
 * Verifica XP, Promoção de Rank, Sequência e Conquistas.
 * @param {object} currentUser - O objeto do usuário antes do treino.
 * @param {number} xpGanhos - XP ganho nesta sessão.
 * @param {string} lastTrainingDate - Data (string) do último treino (do AuthContext).
 * @returns {object} O novo estado atualizado do usuário.
 */
const checkProgresso = (currentUser, xpGanhos, lastTrainingDate) => {
    const novoXp = (currentUser.xp || 0) + xpGanhos;
    const novosTreinos = (currentUser.treinos_concluidos || 0) + 1;
    let novoRank = currentUser.rank;
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

    // 2. Lógica de Sequência Diária (Streak)
    let novaSequencia = currentUser.sequencia || 0;
    const today = new Date().toDateString();
    
    if (lastTrainingDate !== today) {
        novaSequencia++; // Incrementa a sequência se o último treino não foi hoje
    }

    // 3. Checa Conquistas
    let conquistas = Array.isArray(currentUser.conquistas) ? [...currentUser.conquistas] : [];
    
    const checkAndAddConquista = (key, title) => {
        if (!conquistas.includes(key)) {
            conquistas.push(key);
            Alert.alert("Conquista Desbloqueada!", title);
        }
    }
    
    if (novosTreinos >= 1) checkAndAddConquista('treino_1', "Primeiro Treino Concluído!");
    if (novaSequencia >= 3) checkAndAddConquista('sequencia_3', "3 Dias de Foco!");
    if (novaSequencia >= 7) checkAndAddConquista('sequencia_7', "Sequência Semanal!");
    if (isRankUp) {
        checkAndAddConquista('rank_up_1', `Primeira Promoção: Bem-vinda ao Rank ${novoRank}!`);
        if (RANK_ORDER.indexOf(novoRank) >= RANK_ORDER.indexOf('Prata')) { 
            checkAndAddConquista('rank_up_3', "Impulso na Carreira!");
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

/**
 * @summary Formata segundos (número) para uma string "MM:SS".
 */
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * @summary Tela do Player de Treino.
 * Exibe o vídeo do exercício, um cronômetro, e salva o progresso ao concluir.
 */
export default function TrainingPlayerScreen({ route, navigation }) {
    const { exercise } = route.params; // Recebe o exercício selecionado
    const videoRef = useRef(null); 
    const [seconds, setSeconds] = useState(0); // Estado do cronômetro
    const [isModalVisible, setModalVisible] = useState(false); // Visibilidade do modal de XP
    const intervalRef = useRef(null);
    const { user, login, updateStreak, getLastTrainingDate } = useAuth();

    // Inicia o cronômetro quando a tela é montada
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);
        // Limpa o intervalo ao desmontar a tela (sair)
        return () => clearInterval(intervalRef.current);
    }, []);

    /**
     * @summary Chamado ao clicar em "Marcar como Concluído".
     * Para o cronômetro e exibe o modal de feedback.
     */
    const handleCompleteTraining = () => {
        clearInterval(intervalRef.current);
        setModalVisible(true);
    };

    /**
     * @summary Chamado ao fechar o modal de feedback.
     * Calcula o progresso (checkProgresso), salva na API (PUT)
     * e atualiza o AuthContext (login, updateStreak).
     */
    const handleCloseModal = async () => {
        setModalVisible(false);
        const xpGanhos = 10; // XP fixo por treino

        if (!user) {
            navigation.goBack();
            return;
        }

        try {
            const lastTrainingDate = getLastTrainingDate();
            const progressoAtualizado = checkProgresso(user, xpGanhos, lastTrainingDate);

            // Envia os dados atualizados para o MockAPI
            const response = await axios.put(`${API_BASE_URL}/${user.id}`, progressoAtualizado);
            
            // Atualiza o usuário no contexto global
            login(response.data);
            
            // Salva a data de hoje no storage (se for o primeiro treino do dia)
            if (lastTrainingDate !== new Date().toDateString()) {
                updateStreak();
            }
            
        } catch (error) {
            console.error("Erro ao salvar progresso (MockAPI):", error);
            Alert.alert("Erro", "Não foi possível salvar seu progresso.");
        }
        
        navigation.goBack(); // Volta para a tela de seleção
    };

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Voltar</Text>
                    </TouchableOpacity>
                </View>

                {/* CORREÇÃO: Adicionado ScrollView para telas menores */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>{exercise.title}</Text>
                    <Text style={styles.difficulty}>{exercise.difficulty}</Text>

                    {/* CORREÇÃO: Vídeo agora usa 'aspectRatio' para responsividade */}
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
                </ScrollView>

                {/* Modal de Feedback (reutilizável) */}
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
    header: { padding: 20, paddingBottom: 0 }, 
    backButton: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingBottom: 40, 
    },
    title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    difficulty: { color: '#00FFC2', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    video: {
        width: '100%',
        aspectRatio: 16 / 9, 
        borderRadius: 15,
        backgroundColor: 'black', 
    },
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