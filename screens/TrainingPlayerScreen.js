import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import XPFeedbackModal from '../components/XPFeedbackModal';


const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function TrainingPlayerScreen({ route, navigation }) {
    const { exercise } = route.params;
    const [playing, setPlaying] = useState(false);

   
    const [seconds, setSeconds] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const intervalRef = useRef(null);

  
    useEffect(() => {
       
        intervalRef.current = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);

        
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    const onStateChange = useCallback((state) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

   
    const handleCompleteTraining = () => {
        clearInterval(intervalRef.current); 
        setModalVisible(true); 
    };

    const handleCloseModal = () => {
        setModalVisible(false);
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

                    <View style={styles.videoContainer}>
                        <YoutubeIframe height={220} play={playing} videoId={exercise.videoId} onChangeState={onStateChange} />
                    </View>

                    {/* 5. EXIBIÇÃO DO CRONÔMETRO */}
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

                {/* 6. RENDERIZAÇÃO DO MODAL */}
                <XPFeedbackModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                    xp={10} // Podemos deixar dinâmico no futuro
                    time={formatTime(seconds)}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

// ADICIONAMOS NOVOS ESTILOS
const styles = StyleSheet.create({
    // ... (estilos header, backButton, content, title, difficulty, videoContainer)
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