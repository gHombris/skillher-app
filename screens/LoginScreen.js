import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const logoImage = require('../assets/logo.png'); // Reutilizando o logo

export default function LoginScreen({ navigation }) {
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
        />
        <TextInput
          style={styles.input}
          placeholder="Insira sua senha"
          placeholderTextColor="#B0B0B0"
          secureTextEntry // Para esconder a senha
        />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Dashboard')} // Ação de login
        >
          <Text style={styles.primaryButtonText}>Entrar</Text>
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