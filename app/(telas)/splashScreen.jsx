import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const insets = useSafeAreaInsets();

  function LogoTitle() {
    return (
      <Image 
        style={styles.logo} // Estilo dedicado
        source={require('../../assets/images/logo.png')}
        accessibilityLabel="Logo da MerolliSoft"
      />
    );
  }

  const handleCadastro = () => {
    router.push('escolhaOSCadastro'); 
  };

  const handleConsulta = () => {
    router.push('escolhaOsConsulta');
  };
  // -----------------------------

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: props => <LogoTitle {...props} />,
          headerTitle: '', // Limpa o título central para que apenas o logo apareça
          gestureEnabled: false, // Desabilita o gesto de voltar (boa prática com headerLeft customizado)
          headerStyle: {
            backgroundColor: '#000', // Cor de fundo do cabeçalho
          },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
         
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleCadastro}
          >
            <Text style={styles.optionText}>Cadastro Inventário</Text>
            <Image
              source={require('../../assets/images/cadastro.png')}
              style={styles.optionImage}
            />
          </TouchableOpacity>

          {/* BOTÃO CONSULTA */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleConsulta}
          >
            <Text style={styles.optionText}>Consulta Inventário</Text>
            <Image
              source={require('../../assets/images/consulta.png')} 
              style={styles.optionImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
logo: {
    width: 140,
    height: 35,
    resizeMode: 'contain', 
    // ADICIONE UM MARGIN para dar um pequeno espaçamento da borda, se desejar
    marginLeft: 10,
},


  optionsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    marginVertical: 40,
  },
  optionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  optionImage: {
    width: 118,
    height: 118,
  },

});

export default SplashScreen;