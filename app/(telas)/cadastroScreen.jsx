import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app'; 

export default function CadastroScreen() {
    
  // --- Estados para os parâmetros recebidos ---
  const [osId, setOsId] = useState(null);
  const [pedidoNumero, setPedidoNumero] = useState(null);

  // --- Estados para cada campo do formulário ---
  const [nossaTag, setNossaTag] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [setor, setSetor] = useState('');
  const [nomeColaborador, setNomeColaborador] = useState('');
  const [familia, setFamilia] = useState('');
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const params = useLocalSearchParams();
 const { tag } = params;

  useEffect(() => {
    console.log('Parâmetros recebidos da navegação:', params);
    if (params.osId) {
      setOsId(params.osId);
    }
    if (params.pedidoNumero) {
    setPedidoNumero(params.pedidoNumero);
 }

  }, [params]);

const handleSalvar = async () => {

    // 1. EXTRAÇÃO ROBUSTA: Use os estados que foram populados pelo useEffect
    // Esta é a principal alteração.
    const osIdFinal = osId;
    const pedidoNumeroFinal = pedidoNumero;

    // 2. VALIDAÇÃO CRÍTICA DOS PARÂMETROS
    if (!osIdFinal || !pedidoNumeroFinal) {
        console.error('Dados de navegação ausentes nos estados:', { osIdFinal, pedidoNumeroFinal });
        Alert.alert('Erro de Sistema', 'OS ID e/ou Número do Pedido não foram recebidos corretamente. Tente novamente.');
        return;
    }

    // 3. VALIDAÇÃO DOS CAMPOS DO FORMULÁRIO
    if (!nossaTag || !nomeCliente || !selectedStatus) {
        Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios: Nossa Tag, Nome do Cliente e Status.');
        return;
    }

    const payload = {
        // USANDO OS VALORES FINAIS E GARANTIDOS
        osId: osIdFinal,
        pedidoNumero: pedidoNumeroFinal,
        tagCliente: tag,
        nossaTag,
        nomeCliente,
        setor,
        nomeColaborador,
        familia,
        tipo,
        descricao,
        marca,
        modelo,
        numeroSerie,
        imei1,
        imei2,
        statusProduto: selectedStatus
    };

    try {
        await axios.post(`${API_BASE_URL}/api/inventario`, payload);
        
        Alert.alert('Sucesso!', 'Item cadastrado no inventário com sucesso.', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    } catch (error) {
        console.error('Erro ao salvar inventário:', error.response?.data || error.message);
        Alert.alert(
            'Falha no Cadastro',
            `Não foi possível salvar o item. Detalhes: ${error.response?.data?.message || 'Erro de conexão ou servidor.'}`
        );
    }
};

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cadastro do Inventário',
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
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
        
        <Text style={[styles.label, { color: '#000' }]} >T a g   d o   c l i e n t e</Text>
       <TextInput
            style={styles.input}
            placeholderTextColor="#757575ff"
             value={tag || 'Nenhum código encontrado.'}  
          />

          <Text style={[styles.label, { color: '#9c2a2aff' }]}>N o s s a   t a g</Text>
          <TextInput
            style={styles.input}
            placeholder="N o s s a  t a g"
            placeholderTextColor="#757575ff"
             value={nossaTag} 
            onChangeText={setNossaTag} 
          />
      
          <Text style={[styles.label, { color: '#4c6d09ff' }]}>N o m e   d o   c l i e n t e</Text>
          <TextInput
            style={styles.input}
            placeholder="N o m e   d o   c l i e n t e"
            placeholderTextColor="#757575ff"
             value={nomeCliente} 
            onChangeText={setNomeCliente} 
          />
         
          <Text style={[styles.label, { color: '#911a5fff' }]}>S e t o r</Text>
          <TextInput
            style={styles.input}
            placeholder="S e t o r"
            placeholderTextColor="#757575ff"
             value={setor} 
            onChangeText={setSetor} 
          />

          <Text style={[styles.label, { color: '#1e8368ff' }]}>N o m e   d o   c o l a b o r a d o r</Text>
          <TextInput
            style={styles.input}
            placeholder="N o m e  d o  c o l a b o r a d o "
            placeholderTextColor="#757575ff"
             value={nomeColaborador} 
            onChangeText={setNomeColaborador} 
          />

          <Text style={[styles.label, { color: '#2f1c90ff' }]}>F a m í l i a</Text>
          <TextInput
            style={styles.input}
            placeholder="F a m í l i a"
            placeholderTextColor="#757575ff"
             value={familia} 
            onChangeText={setFamilia} 
          />
       
          <Text style={[styles.label, { color: '#520983ff' }]}>T i p o</Text>
          <TextInput
            style={styles.input}
            placeholder="T i p o"
            placeholderTextColor="#757575ff"
             value={tipo} 
            onChangeText={setTipo} 
          />
     
          <Text style={[styles.label, { color: '#7d580eff' }]}>D e s c r i ç ã o   do   p r o d u t o</Text>
          <TextInput
            style={styles.input}
            placeholder="D e s c r i ç ã o  do  p r o d u t o"
            placeholderTextColor="#757575ff"
             value={descricao} 
            onChangeText={setDescricao} 
          />
          
          <Text style={[styles.label, { color: '#8b0932ff' }]}>M a r c a</Text>
          <TextInput
            style={styles.input}
            placeholder="M a r c a"
            placeholderTextColor="#757575ff"
             value={marca} 
            onChangeText={setMarca} 
          />
        
          <Text style={[styles.label, { color: '#416d0eff' }]}>M o d e l o</Text>
          <TextInput
            style={styles.input}
            placeholder="M o d e l o"
            placeholderTextColor="#757575ff"
             value={modelo} 
            onChangeText={setModelo} 
          />
          
          <Text style={[styles.label, { color: '#765805ff' }]}>N°  d e  s é r i e</Text>
          <TextInput
            style={styles.input}
            placeholder="N°  d e  s é r i e"
            placeholderTextColor="#757575ff"
             value={numeroSerie} 
            onChangeText={setNumeroSerie} 
          />
       
          <Text style={[styles.label, { color: '#2e4f0bff' }]}>I m e i  1</Text>
          <TextInput
            style={styles.input}
            placeholder="I m e i  1"
            placeholderTextColor="#757575ff"
             value={imei1} 
            onChangeText={setImei1} 
          />

          <Text style={[styles.label, { color: '#174a6fff' }]}>I m e i  2</Text>
          <TextInput
            style={styles.input}
            placeholder="I m e i  2"
            placeholderTextColor="#757575ff"
             value={imei2} 
            onChangeText={setImei2} 
          />
          
          <Text style={[styles.label, { color: '#154b0cff' }]}>S t a t u s  d o  p r o d u t o</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
          style={styles.picker}
        >

          <Picker.Item label="S e l e c i o n e  u m  s t a t u s" value="" color="#757575ff" />
          <Picker.Item label="Novo na caixa" value="novo" color="#000" />
          <Picker.Item label="Normal em uso" value="normal_em_uso" color="#000" />
          <Picker.Item label="Defeito em uso" value="defeito_em_uso" color="#000" />
          <Picker.Item label="Sucata" value="sucata" color="#000" />
        </Picker>

      </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000', 
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#000', 
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: '10%',
  },
  input: {
    width: '95%',
    height: 46,
    backgroundColor: '#fff', 
    color: '#000', 
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1, 
    borderColor: '#222222ff',
    fontWeight: 600
  },

  saveButton: {
    backgroundColor: '#0a3e0cff',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    color: '#fff', 
    fontSize: 20,
    fontWeight: 'bold',
  },
 
  pickerContainer: {
    width: '95%',
    borderColor: '#222222',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#000',
    fontWeight: 600
  },
});