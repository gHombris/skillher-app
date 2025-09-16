// components/XPFeedbackModal.js
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function XPFeedbackModal({ visible, onClose, xp, time }) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <LinearGradient
                    colors={['#00FFC2', '#4D008C']}
                    style={styles.modalView}
                >
                    <Text style={styles.modalTitle}>TREINO FINALIZADO!</Text>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Tempo</Text>
                            <Text style={styles.statValue}>{time}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>XP Ganhos</Text>
                            <Text style={styles.statValue}>+{xp} XP</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>CONTINUAR</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 16,
        color: 'white',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        elevation: 2,
    },
    buttonText: {
        color: '#4D008C',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});