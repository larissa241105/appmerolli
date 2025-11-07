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
        style={styles.logo} 
        source={require('../../assets/images/logo2.png')}
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


  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: props => <LogoTitle {...props} />,
          headerTitle: '', 
          gestureEnabled: false, 
          headerStyle: {
            backgroundColor: '#000', 
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