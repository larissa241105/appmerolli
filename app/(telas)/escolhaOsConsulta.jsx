import { Stack, router } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';


export default function EscolhaOSConsulta() {
 
  const [cliente, setCliente] = useState('');
  const [ordemServico, setOrdemServico] = useState('');
  const [unidade, setUnidade] = useState('');

  const handleSalvar = () => {
    router.push('listadeProdutoInventario');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'MerolliSoft', 
          headerStyle: {
            backgroundColor: '#000000ff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#ffffffff',
          },
          headerTintColor: '#ffffffff',
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.formContainer}>
            <Text style={styles.title}>Consultar Inventário</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cliente}
                onValueChange={(itemValue) => setCliente(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Cliente" value="" enabled={false} style={{ color: 'gray' }} />
              
                <Picker.Item label="Cliente A" value="cliente_a" />
                <Picker.Item label="Cliente B" value="cliente_b" />
              </Picker>
            </View>

          
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ordemServico}
                onValueChange={(itemValue) => setOrdemServico(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Ordem de Serviço" value="" enabled={false} style={{ color: 'gray' }} />
              
                <Picker.Item label="OS-001" value="os_001" />
                <Picker.Item label="OS-002" value="os_002" />
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={unidade}
                onValueChange={(itemValue) => setUnidade(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Unidade" value="" enabled={false} style={{ color: 'gray' }} />
              
                <Picker.Item label="Unidade Principal" value="un_principal" />
                <Picker.Item label="Unidade Filial" value="un_filial" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSalvar}>
              <Text style={styles.buttonText}>Consultar</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

// --- Estilos para os componentes ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', // Fundo preto para a tela inteira
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fundo branco para a área do formulário
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center'
  },
  title: {
    fontSize: 36,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'serif', // Fonte serifada para um estilo mais clássico
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 25,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#0b4f05ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});