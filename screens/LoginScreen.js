import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const logoImage = require('../assets/Skill.png'); 
const API_BASE_URL = 'https://690d3068a6d92d83e850b9ff.mockapi.io/jogadora'; // MOCKAPI

/**
 * @summary Tela de Login.
 * Permite que usuários existentes acessem suas contas.
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Hook para chamar a função de login global

  /**
   * @summary Processa a tentativa de login.
   * Valida os campos e faz uma requisição GET (filtrada) para o MockAPI.
   * Se o usuário for encontrado, salva no AuthContext e navega para o App.
   */
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha o email e a senha.");
      setLoading(false);
      return;
    }

    try {
      // LÓGICA MUDADA PARA O MOCKAPI (GET com filtros)
      const response = await axios.get(API_BASE_URL, {
        params: {
          email: email,
          password_hash: password // MockAPI não faz hash, compara texto puro
        }
      });

      if (response.data && response.data.length > 0) {
        const user = response.data[0];
        login(user); // Salva no contexto
        navigation.navigate('App'); // Navega para o app
      } else {
        Alert.alert("Erro no Login", "Credenciais inválidas.");
      }

    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao MockAPI.");
      console.error("Erro ao fazer login (MockAPI):", error);
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
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Entre na sua conta</Text>

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

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Criar</Text>
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
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: 'white', fontSize: 16 },
    linkText: { color: '#00FFC2', fontSize: 16, fontWeight: 'bold' }
});