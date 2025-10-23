import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
// Importação do Expo Camera ou outro pacote de scanner de QR Code seria necessário aqui
// Ex: import { Camera } from 'expo-camera';

const { width } = Dimensions.get('window');

const QrcodeScreen = () => { // Nome da função alterado para PascalCase (padrão React)
  const insets = useSafeAreaInsets();

  function LogoTitle() {
    return (
      <Image
        style={styles.logo}
        source={require('../../assets/images/logo.png')}
        accessibilityLabel="Logo da MerolliSoft"
      />
    );
  }

  // Ação de Cadastro pode ser o scanner de QR Code
  const handleScanQrcode = () => {
    // Aqui você navegaria para a tela do scanner de QR Code (home foi usado como placeholder)
    router.push('biparqrcodeScreen'); // Idealmente, você usaria uma rota para a tela de scanner
  };

  const handleSearchPlaqueta = () => {
    // Lógica para consultar a plaqueta com o número digitado
    console.log('Consultar plaqueta');
    // router.push('consultaScreen');
  };
  // -----------------------------

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: props => <LogoTitle {...props} />,
          headerTitle: '',
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleScanQrcode}
            activeOpacity={0.7}
          >
            <Text style={styles.qrButtonTitle}>Bipar QR Code do Cliente</Text>
            <Image
              source={require('../../assets/images/qrcode.png')}
              style={styles.qrImage}
            />
            <Text style={styles.qrButtonSubtitle}>Toque no ícone do qrcode para abrir o leitor</Text>
          </TouchableOpacity>

        
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Seção 2: Digitar Número da Plaqueta */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Digitar Número da Plaqueta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 123456"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10} // Ajuste conforme o padrão da plaqueta
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSearchPlaqueta}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </>
  );
};

// ---
// ## Estilos
// ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff', // Fundo mais suave para contraste
    alignItems: 'center',
    justifyContent: 'center', // Centraliza verticalmente o conteúdo
    paddingTop: 30, // Espaçamento do topo após o header
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 35,
    resizeMode: 'contain',
    marginLeft: 10,
  },

  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },

  // Estilos do Botão QR Code (Card Principal)
  qrButton: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrButtonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  qrButtonSubtitle: {
    fontSize: 12,
    color: '#a20606ff', // Usando a cor de destaque do botão salvar
    fontWeight: '700',
    marginTop: 5,
  },

  // Estilos do Separador "OU"
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },

  // Estilos da Seção de Input
  inputSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff', // Fundo branco para a seção de input
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f9f9f9', // Fundo levemente cinza no input
    color: '#000',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc', // Borda mais clara
    fontWeight: '500',
    textAlign: 'center', // Centraliza o texto para números
  },

  // Estilos do Botão Salvar/Consultar
  saveButton: {
    backgroundColor: '#0a3e0cff', // Verde forte
    paddingVertical: 14,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default QrcodeScreen;