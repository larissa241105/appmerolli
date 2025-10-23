import { Stack } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

export default function EditarProdutoInventario() {
  // Estados para cada campo do formulário, pré-preenchidos com os dados da imagem
  const [tagCliente, setTagCliente] = useState('0123');
  const [nossaTag, setNossaTag] = useState('0147');
  const [nomeCliente, setNomeCliente] = useState('Samsung');
  const [setor, setSetor] = useState('Sala de reunião');
  const [colaborador, setColaborador] = useState('Fulano');
  const [familia, setFamilia] = useState('informatica');
  const [tipo, setTipo] = useState('notebook');
  const [descricao, setDescricao] = useState('Notebook preto');
  const [marca, setMarca] = useState('lenovo');
  const [modelo, setModelo] = useState('54612V451D2CA');
  const [numSerie, setNumSerie] = useState('78945126845');
  const [imei1, setImei1] = useState('Imei 1');
  const [imei2, setImei2] = useState('Imei 2');
  const [status, setStatus] = useState('novo');

  const handleEditar = () => {
    console.log('Dados do formulário:', {
      tagCliente,
      nossaTag,
      nomeCliente,
      setor,
      
    });
    alert('Produto editado!');
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
        <TextInput style={styles.input} value={colaborador} onChangeText={setColaborador} />
        
        {/* --- Pickers (Dropdowns) --- */}
        <Text style={styles.label}>Família</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={familia} onValueChange={(itemValue) => setFamilia(itemValue)}>
            <Picker.Item label="Informática" value="informatica" />
            <Picker.Item label="Mobiliário" value="mobiliario" />
          </Picker>
        </View>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)}>
            <Picker.Item label="Notebook" value="notebook" />
            <Picker.Item label="Desktop" value="desktop" />
            <Picker.Item label="Monitor" value="monitor" />
          </Picker>
        </View>

        <Text style={styles.label}>Descrição do produto</Text>
        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} />

        <Text style={styles.label}>Marca</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={marca} onValueChange={(itemValue) => setMarca(itemValue)}>
            <Picker.Item label="Lenovo" value="lenovo" />
            <Picker.Item label="Dell" value="dell" />
            <Picker.Item label="HP" value="hp" />
            <Picker.Item label="Samsung" value="samsung" />
          </Picker>
        </View>

        <Text style={styles.label}>Modelo</Text>
        <TextInput style={styles.input} value={modelo} onChangeText={setModelo} />

        <Text style={styles.label}>N° de série</Text>
        <TextInput style={styles.input} value={numSerie} onChangeText={setNumSerie} />

        <Text style={styles.label}>Imei 1</Text>
        <TextInput style={styles.input} value={imei1} onChangeText={setImei1} />

        <Text style={styles.label}>Imei 2</Text>
        <TextInput style={styles.input} value={imei2} onChangeText={setImei2} />

        <Text style={styles.label}>Status do produto</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)}>
            <Picker.Item label="Novo em caixa" value="novo" />
            <Picker.Item label="Em uso" value="em_uso" />
            <Picker.Item label="Para reparo" value="reparo" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEditar}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', 
  },
  button: {
    backgroundColor: '#0b4f05ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});