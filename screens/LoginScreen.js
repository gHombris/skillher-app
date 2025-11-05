import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

// <<< NOVO: Importar o hook useAuth
import { useAuth } from '../context/AuthContext'; 

const logoImage = require('../assets/Skill.png'); 
const API_BASE_URL = 'http://192.168.15.173:5000'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // <<< NOVO: Pegar a função de login do nosso contexto
  const { login } = useAuth();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha o email e a senha.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: email,
        password: password
      });

      console.log("Login bem-sucedido:", response.data);
      
      // <<< NOVO: Aqui salvamos o usuário no estado global
      login(response.data); 
      
      navigation.navigate('App');

    } catch (error) {
      // 3. Se der errado (ex: 401 Credenciais Inválidas)
      if (error.response && error.response.data) {
        Alert.alert("Erro no Login", error.response.data.message); // Mostra a mensagem da API (ex: "Credenciais inválidas")
      } else {
        Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
      }
      console.error("Erro ao fazer login:", error);
    } finally {
      setLoading(false); // Libera o botão
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

        <Text style={styles.title}>Entre na sua conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Insira seu email"
          placeholderTextColor="#B0B0B0"
          keyboardType="email-address"
          value={email} // <<< NOVO
          onChangeText={setEmail} // <<< NOVO
          autoCapitalize="none" // <<< NOVO
        />
        <TextInput
          style={styles.input}
          placeholder="Insira sua senha"
          placeholderTextColor="#B0B0B0"
          secureTextEntry // Para esconder a senha
          value={password} // <<< NOVO
          onChangeText={setPassword} // <<< NOVO
        />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleLogin} // <<< NOVO: Chama nossa função de login
          disabled={loading} // <<< NOVO: Desabilita o botão enquanto carrega
        >
          <Text style={styles.primaryButtonText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>

        <Text style={styles.separatorText}>Ou</Text>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Continuar com o Google</Text>
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

// Estilos (sem modificações)
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