import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import axios from 'axios';

const API_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function LoginScreen() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o CPF e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/login/auxiliar`, {
        usuario: cpf,
        senha: password,   
      });

      const { user } = response.data;

      Alert.alert('Login bem-sucedido!', `Bem-vindo, ${user.nome}!`);

      router.replace('splashScreen');

    } catch (error) {
      if (error.response) {
        
        const errorMessage = error.response.data.message || 'Erro desconhecido ao tentar logar.';
        Alert.alert('Falha no Login', errorMessage);
        console.log('Falha no Login (servidor):', errorMessage);

      } else {
       
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua URL ou a conexão.');
        console.error('Erro de rede:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
   return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Ajuste fino opcional
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerlogo}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.textLogin}>Login</Text>
          <FloatingLabelInput
            label="Cpf"
            keyboardType="numeric"
            mask="123.456.789-00"
            staticLabel
            containerStyles={{
              borderWidth: 2,
              paddingHorizontal: 10,
              backgroundColor: '#ffffffff',
              borderColor: '#494949ff',
              borderRadius: 8,
              height: 50
            }}
            customLabelStyles={{
              colorFocused: '#262626ff',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#ffffffff',
              paddingHorizontal: 5,
            }}
            inputStyles={{
              color: '#262626ff',
              paddingHorizontal: 10,
            }}
            value={cpf}
            onChangeText={value => setCpf(value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <FloatingLabelInput
            label="Senha"
            staticLabel
            containerStyles={{
              borderWidth: 2,
              paddingHorizontal: 10,
              backgroundColor: '#fff',
              borderColor: '#494949ff',
              borderRadius: 8,
              height: 53
            }}
            customLabelStyles={{
              colorFocused: '#262626ff',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#fff',
              paddingHorizontal: 5,
            }}
            inputStyles={{
              color: '#262626ff',
              paddingHorizontal: 10,
            }}
            value={password}
            isPassword={!showPassword}
            togglePassword={showPassword}
            onChangeText={value => setPassword(value)}
            customShowPasswordComponent={<Text>Mostrar</Text>}
            customHidePasswordComponent={<Text>Ocultar</Text>}

        />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, 
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 235,
    height: 50,
    marginBottom: 80
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  textLogin: {
    color: '#000000ff',
    fontSize: 35,
    fontWeight: '600',
    paddingBottom: 20,
    textAlign: 'center',
  },
  containerlogo: {
    alignItems: 'center'
  },
  loginButton: {
    width: '60%',
    backgroundColor: '#000000ff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});