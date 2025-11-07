import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const logoImage = require('../assets/Skill.png'); 
const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // <<< MOCKAPI

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);

    if (!nome || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      // LÓGICA MUDADA (POST direto para /jogadora com dados padrão)
      const response = await axios.post(API_BASE_URL, {
        nome: nome,
        email: email,
        password_hash: password, // O MockAPI vai salvar a senha como texto
        // Valores padrão (para bater com o schema)
        xp: 10,
        rank: 'Ferro',
        treinos_concluidos: 0,
        sequencia: 0,
        avatar_filename: 'ana.png' // Avatar padrão
      });

      console.log("Registro (MockAPI) bem-sucedido:", response.data);
      login(response.data);
      navigation.navigate('App');

    } catch (error) {
      Alert.alert("Erro no Registro", "Não foi possível criar a conta no MockAPI.");
      console.error("Erro ao registrar (MockAPI):", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#00FFC2', '#4D008C']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Image source={logoImage} style={styles.logo} />
        </View>
        
        <Text style={styles.title}>Crie sua conta</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Nome de usuário" 
          placeholderTextColor="#B0B0B0" 
          value={nome}
          onChangeText={setNome}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Insira seu email" 
          placeholderTextColor="#B0B0B0" 
          keyboardType="email-address" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Insira sua senha" 
          placeholderTextColor="#B0B0B0" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Insira sua senha novamente" 
          placeholderTextColor="#B0B0B0" 
          secureTextEntry 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? "Criando..." : "Criar uma conta"}</Text>
        </TouchableOpacity>        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
    header: { position: 'absolute', top: 50, left: 20, width: '100%', alignItems: 'center' },
    logo: { width: 100, height: 80, resizeMode: 'contain' },
    backButton: { position: 'absolute', left: 0, top: 10, color: 'white', fontSize: 30 },
    title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15 },
    primaryButton: { backgroundColor: '#00FFC2', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginVertical: 10 },
    primaryButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    separatorText: { color: 'white', textAlign: 'center', marginVertical: 15 },
    secondaryButton: { backgroundColor: 'white', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
    secondaryButtonText: { color: '#333', fontSize: 18, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: 'white', fontSize: 16 },
    linkText: { color: '#00FFC2', fontSize: 16, fontWeight: 'bold' }
});