import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  FlatList,
  Image 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

// --- COMPONENTE MODAL DE PESQUISA (Reutilizado do Cadastro) ---
const SearchableModal = ({ visible, onClose, options, onSelect, title, search, setSearch }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            value={search}
            onChangeText={setSearch}
          />
          
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function EditarProdutoInventario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Recupera o item passado via parâmetro
  const item = params.item ? JSON.parse(params.item) : {};

  // --- ESTADOS DO FORMULÁRIO ---
  const [tagCliente, setTagCliente] = useState(item.tag_cliente || item.tagCliente || '');
  const [nossaTag, setNossaTag] = useState(item.nossa_tag || item.nossaTag || '');
  const [nomeCliente, setNomeCliente] = useState(item.nome_cliente || item.nomeCliente || '');
  const [setor, setSetor] = useState(item.setor || '');
  const [nomeColaborador, setNomeColaborador] = useState(item.nome_colaborador || item.nomeColaborador || '');
  const [familia, setFamilia] = useState(item.familia || '');
  const [tipo, setTipo] = useState(item.tipo || '');
  const [descricao, setDescricao] = useState(item.descricao || '');
  const [marca, setMarca] = useState(item.marca || '');
  const [modelo, setModelo] = useState(item.modelo || '');
  const [numeroSerie, setNumeroSerie] = useState(item.numero_serie || item.numeroSerie || '');
  const [imei1, setImei1] = useState(item.imei1 || '');
  const [imei2, setImei2] = useState(item.imei2 || '');
  const [statusProduto, setStatusProduto] = useState(item.status_produto || item.statusProduto || '');

  // --- ESTADOS PARA OS MODAIS E OPÇÕES ---
  const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);
  const [setorOptions, setSetorOptions] = useState([]);
  const [filteredSetorOptions, setFilteredSetorOptions] = useState([]);
  const [setorSearch, setSetorSearch] = useState('');

  const [isFamiliaModalVisible, setIsFamiliaModalVisible] = useState(false);
  const [familiaOptions, setFamiliaOptions] = useState([]);
  const [filteredFamiliaOptions, setFilteredFamiliaOptions] = useState([]);
  const [familiaSearch, setFamiliaSearch] = useState('');

  const [isTipoModalVisible, setIsTipoModalVisible] = useState(false);
  const [tipoOptions, setTipoOptions] = useState([]);
  const [filteredTipoOptions, setFilteredTipoOptions] = useState([]);
  const [tipoSearch, setTipoSearch] = useState('');

  const [isMarcaModalVisible, setIsMarcaModalVisible] = useState(false);
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [filteredMarcaOptions, setFilteredMarcaOptions] = useState([]);
  const [marcaSearch, setMarcaSearch] = useState('');

  // --- BUSCAR DADOS DAS APIS (Igual ao Cadastro) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar Setores
        const setorRes = await axios.get(`${API_BASE_URL}/visualizarsetor`);
        const setores = setorRes.data.map(i => i.setor);
        setSetorOptions(setores);
        setFilteredSetorOptions(setores);

        // Buscar Familias
        const familiaRes = await axios.get(`${API_BASE_URL}/visualizarfamilia`);
        const familias = familiaRes.data.map(i => i.familia);
        setFamiliaOptions(familias);
        setFilteredFamiliaOptions(familias);

        // Buscar Tipos
        const tipoRes = await axios.get(`${API_BASE_URL}/visualizartipoproduto`);
        const tipos = tipoRes.data.map(i => i.tipo);
        setTipoOptions(tipos);
        setFilteredTipoOptions(tipos);

        // Buscar Marcas
        const marcaRes = await axios.get(`${API_BASE_URL}/visualizarmarca`);
        const marcas = marcaRes.data.map(i => i.marca);
        setMarcaOptions(marcas);
        setFilteredMarcaOptions(marcas);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Não vamos travar o editor se a API falhar, apenas os selects ficarão vazios
      }
    };
    fetchData();
  }, []);

  // --- EFEITOS DE FILTRO (Igual ao Cadastro) ---
  useEffect(() => {
    setFilteredSetorOptions(
      setorSearch === '' ? setorOptions : setorOptions.filter(o => o.toLowerCase().includes(setorSearch.toLowerCase()))
    );
  }, [setorSearch, setorOptions]);

  useEffect(() => {
    setFilteredFamiliaOptions(
      familiaSearch === '' ? familiaOptions : familiaOptions.filter(o => o.toLowerCase().includes(familiaSearch.toLowerCase()))
    );
  }, [familiaSearch, familiaOptions]);

  useEffect(() => {
    setFilteredTipoOptions(
      tipoSearch === '' ? tipoOptions : tipoOptions.filter(o => o.toLowerCase().includes(tipoSearch.toLowerCase()))
    );
  }, [tipoSearch, tipoOptions]);

  useEffect(() => {
    setFilteredMarcaOptions(
      marcaSearch === '' ? marcaOptions : marcaOptions.filter(o => o.toLowerCase().includes(marcaSearch.toLowerCase()))
    );
  }, [marcaSearch, marcaOptions]);

  // --- FUNÇÕES DE SELEÇÃO ---
  const onSelectSetor = (val) => { setSetor(val); setIsSetorModalVisible(false); setSetorSearch(''); };
  const onSelectFamilia = (val) => { setFamilia(val); setIsFamiliaModalVisible(false); setFamiliaSearch(''); };
  const onSelectTipo = (val) => { setTipo(val); setIsTipoModalVisible(false); setTipoSearch(''); };
  const onSelectMarca = (val) => { setMarca(val); setIsMarcaModalVisible(false); setMarcaSearch(''); };

  // --- FUNÇÃO DE SALVAR EDIÇÃO ---
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
      // Usa o ID do item original para fazer o PUT
      const response = await fetch(`${API_BASE_URL}/api/inventario/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Produto editado com sucesso!', [
            { text: 'OK', onPress: () => router.back() } 
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível editar o produto.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Ocorreu um erro de conexão.');
    }
  };


  const handleExcluir = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventario/${item.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Item excluído com sucesso!', [
          { text: 'OK', onPress: () => router.back() } // Volta para a tela anterior
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível excluir o item.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      Alert.alert('Erro', 'Ocorreu um erro de conexão.');
    }
  };

  // --- MENU DE OPÇÕES (3 PONTINHOS) ---
  const abrirMenuOpcoes = () => {
    Alert.alert(
      "Opções do Item",
      "O que deseja fazer com este item?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir Item",
          style: "destructive", // No iOS fica vermelho
          onPress: () => {
            // Confirmação extra de segurança
            Alert.alert(
              "Tem certeza?",
              "Esta ação não poderá ser desfeita.",
              [
                { text: "Não", style: "cancel" },
                { text: "Sim, Excluir", style: "destructive", onPress: handleExcluir }
              ]
            );
          }
        }
      ]
    );
  };


  return (
    <>
        <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Item</Text>

          <TouchableOpacity onPress={abrirMenuOpcoes} style={styles.menuBtn}>
              <MaterialIcons name="more-vert" size={28} color="#ffffffff" />
          </TouchableOpacity>

            </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>

  
            
            <Text style={[styles.label, { color: '#000' }]}>T a g    d o    c l i e n t e</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={tagCliente}
              editable={false} 
            />

            <Text style={[styles.label, { color: '#9c2a2aff' }]}>N o s s a    t a g *</Text>
            <TextInput
              style={styles.input}
              value={nossaTag}
              onChangeText={setNossaTag}
            />

            <Text style={[styles.label, { color: '#4c6d09ff' }]}>N o m e    d o    c l i e n t e *</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]} 
              value={nomeCliente}
              editable={false} 
            />

            {/* --- SETOR (Modal) --- */}
            <Text style={[styles.label, { color: '#911a5fff' }]}>S e t o r *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setIsSetorModalVisible(true)}>
              <Text style={setor ? styles.inputText : styles.inputPlaceholder}>
                {setor || "Selecione o setor"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: '#1e8368ff' }]}>N o m e    d o    c o l a b o r a d o r</Text>
            <TextInput
              style={styles.input}
              value={nomeColaborador}
              onChangeText={setNomeColaborador}
            />

            <Text style={[styles.label, { color: '#2f1c90ff' }]}>F a m í l i a *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setIsFamiliaModalVisible(true)}>
              <Text style={familia ? styles.inputText : styles.inputPlaceholder}>
                {familia || "Selecione a família"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: '#520983ff' }]}>T i p o *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setIsTipoModalVisible(true)}>
              <Text style={tipo ? styles.inputText : styles.inputPlaceholder}>
                {tipo || "Selecione o tipo"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: '#7d580eff' }]}>D e s c r i ç ã o    d o    p r o d u t o</Text>
            <TextInput
              style={styles.input}
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={[styles.label, { color: '#8b0932ff' }]}>M a r c a *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setIsMarcaModalVisible(true)}>
              <Text style={marca ? styles.inputText : styles.inputPlaceholder}>
                {marca || "Selecione a marca"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: '#416d0eff' }]}>M o d e l o</Text>
            <TextInput
              style={styles.input}
              value={modelo}
              onChangeText={setModelo}
            />

            <Text style={[styles.label, { color: '#765805ff' }]}>N°    d e    s é r i e</Text>
            <TextInput
              style={styles.input}
              value={numeroSerie}
              onChangeText={setNumeroSerie}
            />

            <Text style={[styles.label, { color: '#2e4f0bff' }]}>I m e i  1</Text>
            <TextInput
              style={styles.input}
              value={imei1}
              onChangeText={setImei1}
            />

            <Text style={[styles.label, { color: '#174a6fff' }]}>I m e i  2</Text>
            <TextInput
              style={styles.input}
              value={imei2}
              onChangeText={setImei2}
            />

            <Text style={[styles.label, { color: '#154b0cff' }]}>S t a t u s    d o    p r o d u t o *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={statusProduto}
                onValueChange={(itemValue) => setStatusProduto(itemValue)}
                style={styles.picker}
                dropdownIconColor="#000"
              >
                 <Picker.Item label="Selecione um status" value="" color="#757575ff" />
                 <Picker.Item label="Novo na caixa" value="novo" color="#000" />
                 <Picker.Item label="Normal em uso" value="normal_em_uso" color="#000" />
                 <Picker.Item label="Defeito em uso" value="defeito_em_uso" color="#000" />
                 <Picker.Item label="Sucata" value="sucata" color="#000" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleEditar}>
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </>
  );
}


const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 50 },
  formContainer: { flex: 1 },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
   header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#000000ff', 
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        zIndex: 10,
    },
    backBtn: {
        padding: 5, 
        marginRight: 10,
    },
    menuBtn: {
    padding: 5,
    marginLeft: 0, // Removido o marginLeft fixo
  },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        color: '#ffffffff',
        textAlign: 'center',
    },
  inputText: { color: '#000', fontSize: 16 },
  inputPlaceholder: { color: '#757575ff', fontSize: 16 },
  readOnlyInput: {
    backgroundColor: '#e0e0e0',
    color: '#555',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { height: 55 },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: { fontSize: 16 },
});