import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Button, Alert } from 'react-native'; // Adicionado Alert
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import XPFeedbackModal from '../components/XPFeedbackModal';
import axios from 'axios'; // Importado axios
import { useAuth } from '../context/AuthContext'; // Importado useAuth

// URL da API
const API_BASE_URL = 'http://192.168.15.173:5000'; // CONFIRME SE ESTE IP AINDA É O CORRETO

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

    // Pegamos o usuário e a função de login (para atualizar o contexto)
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

    // Esta função agora salva na API
    const handleCloseModal = async () => {
        setModalVisible(false);
        const xpGanhos = 10; // O XP que o modal informa

        if (!user) {
            console.error("Usuário não logado, não é possível salvar o progresso.");
            navigation.goBack();
            return;
        }

        // Chama a API para salvar o progresso
        try {
            console.log(`Salvando progresso para ID: ${user.id}, XP: ${xpGanhos}`);
            const response = await axios.post(`${API_BASE_URL}/api/jogadora/atualizar_progresso`, {
                user_id: user.id,
                xp_ganho: xpGanhos
            });
            
            // Atualiza o usuário no contexto global com os novos dados (novo XP, etc.)
            login(response.data);
            console.log("Progresso salvo com sucesso!");

        } catch (error) {
            console.error("Erro ao salvar progresso:", error);
            Alert.alert("Erro", "Não foi possível salvar seu progresso. Tente novamente.");
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
                        onPlaybackStatusUpdate={status => {
                            if (status.didJustFinish) {
                                // (lógica de autoplay, etc. pode vir aqui)
                            }
                        }}
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
                    xp={10} // Valor fixo de XP
                    time={formatTime(seconds)}
                />
            </SafeAreaView>
        </LinearGradient>
    );
} // <--- CHAVE DE FECHAMENTO DO COMPONENTE


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