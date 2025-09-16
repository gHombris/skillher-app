import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubeIframe from 'react-native-youtube-iframe';

export default function TrainingPlayerScreen({ route, navigation }) {
    // Recebemos os dados do exercício que foi clicado
    const { exercise } = route.params;
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state) => {
        if (state === "ended") {
            setPlaying(false);
            Alert.alert("Treino Concluído!", "Parabéns por finalizar o exercício!");
        }
    }, []);

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

                    {/* Componente do Player do YouTube */}
                    <View style={styles.videoContainer}>
                        <YoutubeIframe
                            height={300}
                            play={playing}
                            videoId={exercise.videoId}
                            onChangeState={onStateChange}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={() => {
                            Alert.alert("Parabéns!", "Você marcou este treino como concluído e ganhou 10XP!");
                            navigation.goBack();
                        }}
                    >
                        <Text style={styles.completeButtonText}>Marcar como Concluído</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20 },
    backButton: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, paddingHorizontal: 20 },
    title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    difficulty: { color: '#00FFC2', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    videoContainer: {
        borderRadius: 15,
        overflow: 'hidden', // Garante que o vídeo respeite as bordas arredondadas
        marginBottom: 30,
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