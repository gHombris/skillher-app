import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { avatarImages } from './DashboardScreen'; // Importa o mapa de avatares

const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // MOCKAPI

/**
 * @summary Tela de Edição de Perfil.
 * Permite que o usuário logado altere seu nome e avatar.
 */
export default function EditProfileScreen({ navigation }) {
    const { user, login } = useAuth(); 

    const [nome, setNome] = useState(user.nome);
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_filename);
    const [loading, setLoading] = useState(false);

    // Converte o objeto de avatares em uma lista para o .map()
    const avatarList = Object.keys(avatarImages).map(key => ({
        filename: key,
        image: avatarImages[key],
    }));

    /**
     * @summary Salva as alterações do perfil.
     * Faz uma requisição PUT para o MockAPI com o novo nome e avatar.
     */
    const handleSave = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // Requisição PUT para atualizar o usuário
            const response = await axios.put(`${API_BASE_URL}/${user.id}`, {
                nome: nome,
                avatar_filename: selectedAvatar
            });

            // Atualiza o usuário no contexto global
            login(response.data);
            Alert.alert("Sucesso", "Perfil atualizado!");
            navigation.goBack();

        } catch (error) {
            console.error("Erro ao salvar perfil (MockAPI):", error);
            Alert.alert("Erro", "Não foi possível salvar o perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#00FFC2', '#4D008C']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                </View>

                <ScrollView style={styles.content}>
                    <Text style={styles.label}>Nome de Usuária</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholderTextColor="#B0B0B0"
                    />

                    <Text style={styles.label}>Escolha seu Avatar</Text>
                    {/* Grid de Avatares (CSS Grid Intent) */}
                    <View style={styles.avatarGrid}>
                        {avatarList.map((avatar) => (
                            <TouchableOpacity
                                key={avatar.filename}
                                style={[
                                    styles.avatarOption,
                                    selectedAvatar === avatar.filename && styles.avatarSelected
                                ]}
                                onPress={() => setSelectedAvatar(avatar.filename)}
                            >
                                <Image source={avatar.image} style={styles.avatarImage} />
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>{loading ? "Salvando..." : "Salvar Alterações"}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    backButton: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 20 },
    content: { flex: 1, padding: 20 },
    label: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 20 },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
    avatarOption: { padding: 5, borderRadius: 50, margin: 5, backgroundColor: 'transparent' },
    avatarSelected: { backgroundColor: '#00FFC2' },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    footer: { padding: 20 },
    saveButton: { backgroundColor: '#00FFC2', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
    saveButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});