import React, { useState } from 'react'; // 👈 Importar useState
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const QrcodeScreen = () => {
   const insets = useSafeAreaInsets();
  
   const [plaquetaAtualValue, setplaquetaAtualValue] = useState('');
   const params = useLocalSearchParams();

   const CADASTRO_ROUTE = 'home'; 

  
   const handleScanQrcode = () => {
     // Navega para a tela de leitura de QR code
   router.push({
      pathname: 'biparqrcodeScreen',
      params: params // Passa os parâmetros (osId, pedidoNumero, etc.) adiante
    });
  };
   const handleSearchPlaqueta = () => {
       // 2. USAR O VALOR DO ESTADO AQUI
       if (!plaquetaAtualValue.trim()) {
             Alert.alert('Atenção', 'Por favor, digite o número da plaqueta.');
             return;
       }

       console.log(`Consultando plaqueta: ${plaquetaAtualValue}`);

       // ⭐ Enviando o valor digitado como parâmetro
      router.push({
          pathname: CADASTRO_ROUTE,
          params: {
              ...params, // Envia os parâmetros que já tínhamos (osId, etc)
              tag: plaquetaAtualValue.trim(), // E adiciona o novo parâmetro 'tag'
          }
      }); 
   };

   return (
     <>
       <Stack.Screen
        options={{
          title: 'MerolliSoft',
          headerBackTitle: '',
          headerStyle: { backgroundColor: '#000' },
          headerTitleStyle: { fontWeight: 'bold', color: '#fff' },
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
                  maxLength={10} 
                  // 3. VINCULAR O VALOR DO INPUT AO ESTADO
                  value={plaquetaAtualValue}
                  onChangeText={setplaquetaAtualValue} // 👈 Atualiza o estado
               />
               <TouchableOpacity style={styles.saveButton} onPress={handleSearchPlaqueta}>
                  <Text style={styles.saveButtonText}>Buscar/Salvar</Text>
               </TouchableOpacity>
             </View>

          </View>
        </View>
     </>
   );
};

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