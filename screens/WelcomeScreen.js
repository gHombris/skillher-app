import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const teamImage = require('../assets/jogadoras-removebg.png'); 
const logoImage = require('../assets/Skill.png');

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#16FFBB', '#6A0DAD']} // Cores do gradiente
      style={styles.container}
    >
      <View style={styles.content}>
        <Image source={logoImage} style={styles.logo} />
        <Text style={styles.title}>Bem-vinda ao Skill Her!</Text>
        <Text style={styles.subtitle}>Sua jornada no futebol começa agora. Conecte-se, Treine e Evolua.</Text>
        <Image source={teamImage} style={styles.teamImage} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')} // Leva para a tela de Registro
        >
          <Text style={styles.primaryButtonText}>Criar uma conta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')} // Leva para a tela de Login
        >
          <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingBottom: 20 },
  logo: { width: 150, height: 100, resizeMode: 'contain', marginBottom: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: 'white', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 20 },
  teamImage: { width: '100%', height: 200, resizeMode: 'contain' },
  primaryButton: { backgroundColor: '#00FFC2', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'white', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
  secondaryButtonText: { color: '#333', fontSize: 18, fontWeight: 'bold' }
});