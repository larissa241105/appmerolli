import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Button,
  SafeAreaView
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';


const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';
// -----------------------------------------------------------------------


const SearchableModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  search,
  setSearch
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#757575ff"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={options}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <Button title="Fechar" onPress={onClose} color="#9c2a2aff" />
        </SafeAreaView>
      </View>
    </Modal>
  );
};


export default function CadastroScreen() {
  const router = useRouter();
  
  // --- Estados para os parâmetros recebidos ---
  const [osId, setOsId] = useState(null);
  const [pedidoNumero, setPedidoNumero] = useState(null);

  // --- Estados para cada campo do formulário ---
  const [nossaTag, setNossaTag] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  
  // --- Estados que serão selecionáveis ---
  const [setor, setSetor] = useState('');
  const [familia, setFamilia] = useState('');
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  // -----------------------------------------

  const [nomeColaborador, setNomeColaborador] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const params = useLocalSearchParams();
  const { tag } = params;

  // --- Estados para os Modais de Seleção ---

  // Setor
  const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);
  const [setorSearch, setSetorSearch] = useState('');
  const [setorOptions, setSetorOptions] = useState([]);
  const [filteredSetorOptions, setFilteredSetorOptions] = useState([]);

  // Familia
  const [isFamiliaModalVisible, setIsFamiliaModalVisible] = useState(false);
  const [familiaSearch, setFamiliaSearch] = useState('');
  const [familiaOptions, setFamiliaOptions] = useState([]);
  const [filteredFamiliaOptions, setFilteredFamiliaOptions] = useState([]);

  // Tipo
  const [isTipoModalVisible, setIsTipoModalVisible] = useState(false);
  const [tipoSearch, setTipoSearch] = useState('');
  const [tipoOptions, setTipoOptions] = useState([]);
  const [filteredTipoOptions, setFilteredTipoOptions] = useState([]);

  // Marca
  const [isMarcaModalVisible, setIsMarcaModalVisible] = useState(false);
  const [marcaSearch, setMarcaSearch] = useState('');
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [filteredMarcaOptions, setFilteredMarcaOptions] = useState([]);

  
  // --- Efeito para buscar parâmetros da rota ---
  useEffect(() => {
    console.log('Parâmetros recebidos da navegação:', params);
    if (params.osId) {
      setOsId(params.osId);
    }
    if (params.pedidoNumero) {
      setPedidoNumero(params.pedidoNumero);
    }
  }, [params]);

  // --- Efeito para buscar dados das APIs (Setor, Familia, Tipo, Marca) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar Setores
        const setorRes = await axios.get(`${API_BASE_URL}/visualizarsetor`);
        const setores = setorRes.data.map(item => item.setor);
        setSetorOptions(setores);
        setFilteredSetorOptions(setores);

        // Buscar Familias
        const familiaRes = await axios.get(`${API_BASE_URL}/visualizarfamilia`);
        const familias = familiaRes.data.map(item => item.familia);
        setFamiliaOptions(familias);
        setFilteredFamiliaOptions(familias);

        // Buscar Tipos
        const tipoRes = await axios.get(`${API_BASE_URL}/visualizartipoproduto`);
        const tipos = tipoRes.data.map(item => item.tipo);
        setTipoOptions(tipos);
        setFilteredTipoOptions(tipos);

        // Buscar Marcas
        const marcaRes = await axios.get(`${API_BASE_URL}/visualizarmarca`);
        const marcas = marcaRes.data.map(item => item.marca);
        setMarcaOptions(marcas);
        setFilteredMarcaOptions(marcas);

      } catch (error) {
        console.error('Erro ao buscar dados para os selecionáveis:', error);
        Alert.alert('Erro de Rede', 'Não foi possível carregar os dados para os campos de seleção. Verifique a API.');
      }
    };

    fetchData();
  }, []);


  // --- Efeitos para filtrar as listas com base na pesquisa ---
  
  // Filtro Setor
  useEffect(() => {
    if (setorSearch === '') {
      setFilteredSetorOptions(setorOptions);
    } else {
      setFilteredSetorOptions(
        setorOptions.filter(option =>
          option.toLowerCase().includes(setorSearch.toLowerCase())
        )
      );
    }
  }, [setorSearch, setorOptions]);

  // Filtro Família
  useEffect(() => {
    if (familiaSearch === '') {
      setFilteredFamiliaOptions(familiaOptions);
    } else {
      setFilteredFamiliaOptions(
        familiaOptions.filter(option =>
          option.toLowerCase().includes(familiaSearch.toLowerCase())
        )
      );
    }
  }, [familiaSearch, familiaOptions]);

  // Filtro Tipo
  useEffect(() => {
    if (tipoSearch === '') {
      setFilteredTipoOptions(tipoOptions);
    } else {
      setFilteredTipoOptions(
        tipoOptions.filter(option =>
          option.toLowerCase().includes(tipoSearch.toLowerCase())
        )
      );
    }
  }, [tipoSearch, tipoOptions]);

  // Filtro Marca
  useEffect(() => {
    if (marcaSearch === '') {
      setFilteredMarcaOptions(marcaOptions);
    } else {
      setFilteredMarcaOptions(
        marcaOptions.filter(option =>
          option.toLowerCase().includes(marcaSearch.toLowerCase())
        )
      );
    }
  }, [marcaSearch, marcaOptions]);


  // --- Funções de seleção ---
  
  const onSelectSetor = (item) => {
    setSetor(item);
    setIsSetorModalVisible(false);
    setSetorSearch(''); // Limpa a pesquisa
  };
  
  const onSelectFamilia = (item) => {
    setFamilia(item);
    setIsFamiliaModalVisible(false);
    setFamiliaSearch('');
  };

  const onSelectTipo = (item) => {
    setTipo(item);
    setIsTipoModalVisible(false);
    setTipoSearch('');
  };

  const onSelectMarca = (item) => {
    setMarca(item);
    setIsMarcaModalVisible(false);
    setMarcaSearch('');
  };


  const handleSalvar = async () => {
    const osIdFinal = osId;
    const pedidoNumeroFinal = pedidoNumero;

    if (!osIdFinal || !pedidoNumeroFinal) {
      console.error('Dados de navegação ausentes nos estados:', { osIdFinal, pedidoNumeroFinal });
      Alert.alert('Erro de Sistema', 'OS ID e/ou Número do Pedido não foram recebidos corretamente. Tente novamente.');
      return;
    }

    if (!nossaTag || !nomeCliente || !selectedStatus || !setor || !familia || !tipo || !marca) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (marcados com *).');
      return;
    }

    const payload = {
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
          headerStyle: { backgroundColor: '#000000ff' },
          headerTitleStyle: { fontWeight: 'bold', color: '#ffffffff' },
          headerTintColor: '#ffffffff',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
        
          <Text style={[styles.label, { color: '#000' }]}>T a g   d o   c l i e n t e</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]} // Adicionado estilo para campo somente leitura
            placeholderTextColor="#757575ff"
            value={tag || 'Nenhum código encontrado.'}
            editable={false} // Impede edição
          />

          <Text style={[styles.label, { color: '#9c2a2aff' }]}>N o s s a   t a g *</Text>
          <TextInput
            style={styles.input}
            placeholder="N o s s a  t a g"
            placeholderTextColor="#757575ff"
            value={nossaTag}
            onChangeText={setNossaTag}
          />
        
          <Text style={[styles.label, { color: '#4c6d09ff' }]}>N o m e   d o   c l i e n t e *</Text>
          <TextInput
            style={styles.input}
            placeholder="N o m e   d o   c l i e n t e"
            placeholderTextColor="#757575ff"
            value={nomeCliente}
            onChangeText={setNomeCliente}
          />
          
          <Text style={[styles.label, { color: '#911a5fff' }]}>S e t o r *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsSetorModalVisible(true)}>
            <Text style={setor ? styles.inputText : styles.inputPlaceholder}>
              {setor || "S e l e c i o n e  o  s e t o r"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: '#1e8368ff' }]}>N o m e   d o   c o l a b o r a d o r</Text>
          <TextInput
            style={styles.input}
            placeholder="N o m e  d o  c o l a b o r a d o "
            placeholderTextColor="#757575ff"
            value={nomeColaborador}
            onChangeText={setNomeColaborador}
          />

          <Text style={[styles.label, { color: '#2f1c90ff' }]}>F a m í l i a *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsFamiliaModalVisible(true)}>
            <Text style={familia ? styles.inputText : styles.inputPlaceholder}>
              {familia || "S e l e c i o n e  a  f a m í l i a"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.label, { color: '#520983ff' }]}>T i p o *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsTipoModalVisible(true)}>
            <Text style={tipo ? styles.inputText : styles.inputPlaceholder}>
              {tipo || "S e l e c i o n e  o  t i p o"}
            </Text>
          </TouchableOpacity>
          {/* ----------------------------------- */}
        
          <Text style={[styles.label, { color: '#7d580eff' }]}>D e s c r i ç ã o   do   p r o d u t o</Text>
          <TextInput
            style={styles.input}
            placeholder="D e s c r i ç ã o  do  p r o d u t o"
            placeholderTextColor="#757575ff"
            value={descricao}
            onChangeText={setDescricao}
          />
          
          <Text style={[styles.label, { color: '#8b0932ff' }]}>M a r c a *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsMarcaModalVisible(true)}>
            <Text style={marca ? styles.inputText : styles.inputPlaceholder}>
              {marca || "S e l e c i o n e  a  m a r c a"}
            </Text>
          </TouchableOpacity>
        
          <Text style={[styles.label, { color: '#416d0eff' }]}>M o d e l o</Text>
          <TextInput
            style={styles.input}
            placeholder="M o d e l o"
            placeholderTextColor="#757575ff"
            value={modelo}
            onChangeText={setModelo}
          />
          
          <Text style={[styles.label, { color: '#765805ff' }]}>N°  d e  s é r i e</Text>
          <TextInput
            style={styles.input}
            placeholder="N°  d e  s é r i e"
            placeholderTextColor="#757575ff"
            value={numeroSerie}
            onChangeText={setNumeroSerie}
          />
        
          <Text style={[styles.label, { color: '#2e4f0bff' }]}>I m e i  1</Text>
          <TextInput
            style={styles.input}
            placeholder="I m e i  1"
            placeholderTextColor="#757575ff"
            value={imei1}
            onChangeText={setImei1}
          />

          <Text style={[styles.label, { color: '#174a6fff' }]}>I m e i  2</Text>
          <TextInput
            style={styles.input}
            placeholder="I m e i  2"
            placeholderTextColor="#757575ff"
            value={imei2}
            onChangeText={setImei2}
          />
          
          <Text style={[styles.label, { color: '#154b0cff' }]}>S t a t u s  d o  p r o d u t o *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              <Picker.Item label="S e l e c i o n e  u m  s t a t u s" value="" color="#757575ff" />
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

        <SearchableModal
          visible={isSetorModalVisible}
          onClose={() => setIsSetorModalVisible(false)}
          options={filteredSetorOptions}
          onSelect={onSelectSetor}
          title="Selecione o Setor"
          search={setorSearch}
          setSearch={setSetorSearch}
        />

        <SearchableModal
          visible={isFamiliaModalVisible}
          onClose={() => setIsFamiliaModalVisible(false)}
          options={filteredFamiliaOptions}
          onSelect={onSelectFamilia}
          title="Selecione a Família"
          search={familiaSearch}
          setSearch={setFamiliaSearch}
        />

        <SearchableModal
          visible={isTipoModalVisible}
          onClose={() => setIsTipoModalVisible(false)}
          options={filteredTipoOptions}
          onSelect={onSelectTipo}
          title="Selecione o Tipo"
          search={tipoSearch}
          setSearch={setTipoSearch}
        />

        <SearchableModal
          visible={isMarcaModalVisible}
          onClose={() => setIsMarcaModalVisible(false)}
          options={filteredMarcaOptions}
          onSelect={onSelectMarca}
          title="Selecione a Marca"
          search={marcaSearch}
          setSearch={setMarcaSearch}
        />

      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center', 
  },
  readOnlyInput: {
    backgroundColor: '#e9e9e9', 
    color: '#555',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#757575ff',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden', 
  },
  picker: {
    width: '100%',
    color: '#333',
    backgroundColor: 'transparent', 
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%', 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 17,
    color: '#444',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});