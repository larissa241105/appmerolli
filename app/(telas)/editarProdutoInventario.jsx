import React, { useState } from 'react';
// 1. IMPORT CORRIGIDO: Trocamos o 'useRoute' pelo 'useLocalSearchParams'
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

// Adicione a URL base da sua API aqui
const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function EditarProdutoInventario() {
  // 2. PEGANDO OS PARÂMETROS: Usamos o hook do expo-router
  const params = useLocalSearchParams();
  
  
  const item = JSON.parse(params.item);


  const [tagCliente, setTagCliente] = useState(item.tag_cliente || '');
  const [nossaTag, setNossaTag] = useState(item.nossa_tag || '');
  const [nomeCliente, setNomeCliente] = useState(item.nome_cliente || '');
  const [setor, setSetor] = useState(item.setor || '');
  const [nomeColaborador, setNomeColaborador] = useState(item.nome_colaborador || ''); 
  const [familia, setFamilia] = useState(item.familia || '');
  const [tipo, setTipo] = useState(item.tipo || '');
  const [descricao, setDescricao] = useState(item.descricao || '');
  const [marca, setMarca] = useState(item.marca || '');
  const [modelo, setModelo] = useState(item.modelo || '');
  const [numeroSerie, setNumeroSerie] = useState(item.numero_serie || '');
  const [imei1, setImei1] = useState(item.imei1 || '');
  const [imei2, setImei2] = useState(item.imei2 || '');
  const [statusProduto, setStatusProduto] = useState(item.status_produto || '');

  const handleEditar = async () => {
    const dadosAtualizados = {
      tagCliente,
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
      statusProduto,
    };

    try {
    // A URL usa 'item.id', que é perfeito!
    const response = await fetch(`${API_BASE_URL}/api/inventario/${item.id}`, {
      method: 'PUT', // Método PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados),
    });
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Produto editado com sucesso!');
        router.back();
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível editar o produto.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Ocorreu um erro de conexão.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Item', 
          headerStyle: { backgroundColor: '#000000ff' },
          headerTitleStyle: { fontWeight: 'bold', color: '#ffffffff' },
          headerTintColor: '#ffffffff',
        }}
      />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Cliente - Unidade</Text>

        {/* --- Início do Formulário --- */}
        <Text style={styles.label}>Tag do cliente</Text>
        <TextInput style={styles.input} value={tagCliente} onChangeText={setTagCliente} />

        <Text style={styles.label}>Nossa tag</Text>
        <TextInput style={styles.input} value={nossaTag} onChangeText={setNossaTag} />

        <Text style={styles.label}>Nome do cliente</Text>
        <TextInput style={styles.input} value={nomeCliente} onChangeText={setNomeCliente} />

        <Text style={styles.label}>Setor</Text>
        <TextInput style={styles.input} value={setor} onChangeText={setSetor} />

        <Text style={styles.label}>Nome do colaborador</Text>
        <TextInput style={styles.input} value={nomeColaborador} onChangeText={setNomeColaborador} />
        
        {/* --- Pickers (Dropdowns) --- */}
        <Text style={styles.label}>Família</Text>
         <TextInput style={styles.input} value={familia} onChangeText={setFamilia} />


        <Text style={styles.label}>Tipo</Text>
         <TextInput style={styles.input} value={tipo} onChangeText={setTipo} />


        <Text style={styles.label}>Descrição do produto</Text>
        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} />

        <Text style={styles.label}>Marca</Text>
        <TextInput style={styles.input} value={marca} onChangeText={setMarca} />

        <Text style={styles.label}>Modelo</Text>
        <TextInput style={styles.input} value={modelo} onChangeText={setModelo} />

        <Text style={styles.label}>N° de série</Text>
        <TextInput style={styles.input} value={numeroSerie} onChangeText={setNumeroSerie} />

        <Text style={styles.label}>Imei 1</Text>
        <TextInput style={styles.input} value={imei1} onChangeText={setImei1} />

        <Text style={styles.label}>Imei 2</Text>
        <TextInput style={styles.input} value={imei2} onChangeText={setImei2} />

        <Text style={styles.label}>Status do produto</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={statusProduto} onValueChange={(itemValue) => setStatusProduto(itemValue)}>
             <Picker.Item label="Novo na caixa" value="novo" color="#000" />
          <Picker.Item label="Normal em uso" value="normal_em_uso" color="#000" />
          <Picker.Item label="Defeito em uso" value="defeito_em_uso" color="#000" />
          <Picker.Item label="Sucata" value="sucata" color="#000" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEditar}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

// (Adicione seus estilos 'styles' aqui)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#051779ff',
    padding: 15,
    width: '80%',
    borderRadius: 5,
    alignSelf:'center',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});