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
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchableModal from '../src/components/SearchableModal';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

// Hook personalizado para gerenciar as listas de opções
const useInventoryOptions = () => {
  const [options, setOptions] = useState({
    setores: [],
    familias: [],
    tipos: [],
    marcas: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [setorRes, familiaRes, tipoRes, marcaRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/visualizarsetor`),
          axios.get(`${API_BASE_URL}/visualizarfamilia`),
          axios.get(`${API_BASE_URL}/visualizartipoproduto`),
          axios.get(`${API_BASE_URL}/visualizarmarca`)
        ]);

        setOptions({
          setores: setorRes.data.map(i => i.setor),
          familias: familiaRes.data.map(i => i.familia),
          tipos: tipoRes.data.map(i => i.tipo),
          marcas: marcaRes.data.map(i => i.marca),
        });
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
        // Opcional: Alert silencioso ou tratamento específico
      }
    };
    fetchOptions();
  }, []);

  return options;
};


export default function EditarProdutoInventario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // 1. Recuperação Segura dos Dados Iniciais
  const initialData = useMemo(() => {
    return params.item ? JSON.parse(params.item) : {};
  }, [params.item]);

  
  const [form, setForm] = useState({
    tagCliente: initialData.tag_cliente || initialData.tagCliente || '',
    tagAntiga: initialData.tag_antiga || initialData.tag_antiga || '',
    nomeCliente: initialData.nome_cliente || initialData.nomeCliente || '',
    setor: initialData.setor || '',
    nomeColaborador: initialData.nome_colaborador || initialData.nomeColaborador || '',
    familia: initialData.familia || '',
    tipo: initialData.tipo || '',
    descricao: initialData.descricao || '',
    marca: initialData.marca || '',
    modelo: initialData.modelo || '',
    numeroSerie: initialData.numero_serie || initialData.numeroSerie || '',
    imei1: initialData.imei1 || '',
    imei2: initialData.imei2 || '',
    statusProduto: initialData.status_produto || initialData.statusProduto || ''
  });

  // 3. Estado Unificado para os Modais de Busca
  const [modalVisible, setModalVisible] = useState(null); // 'setor', 'familia', 'tipo', 'marca' ou null
  const [searchText, setSearchText] = useState('');

  // 4. Hook customizado (traz as listas da API)
  const options = useInventoryOptions();

  // --- HANDLERS GENÉRICOS ---

  // Atualiza qualquer campo do formulário
  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Lógica de Filtro Dinâmico (substitui os 4 useEffects de filtro)
  const getFilteredOptions = (key) => {
    const list = options[key] || []; // ex: options.setores
    if (!searchText) return list;
    return list.filter(item => item.toLowerCase().includes(searchText.toLowerCase()));
  };

  // Seleção de item no Modal
  const handleSelectOption = (field, value) => {
    updateForm(field, value);
    setModalVisible(null);
    setSearchText('');
  };

  // --- CRUD (SALVAR E EXCLUIR) ---

  const handleEditar = async () => {
    try {
      // Padronizando para axios (como no resto do app)
      await axios.put(`${API_BASE_URL}/api/inventario/${initialData.id}`, form);
      
      Alert.alert('Sucesso', 'Produto editado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro na requisição:', error);
      const msg = error.response?.data?.message || 'Erro de conexão.';
      Alert.alert('Erro', msg);
    }
  };

  const handleExcluir = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/inventario/${initialData.id}`);
      
      Alert.alert('Sucesso', 'Item excluído com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      Alert.alert('Erro', 'Não foi possível excluir o item.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Tem certeza?",
      "Esta ação não poderá ser desfeita.",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim, Excluir", style: "destructive", onPress: handleExcluir }
      ]
    );
  };

  const abrirMenuOpcoes = () => {
    Alert.alert("Opções do Item", "O que deseja fazer?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir Item", style: "destructive", onPress: confirmDelete }
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
    value={form.tagCliente}
    editable={false} 
  />

  <Text style={[styles.label, { color: '#4c6d09ff' }]}>N o m e    d o    c l i e n t e *</Text>
  <TextInput
    style={[styles.input, styles.readOnlyInput]} 
    value={form.nomeCliente}
    editable={false} 
  />

  {/* --- SETOR (Modal) --- */}
  <Text style={[styles.label, { color: '#911a5fff' }]}>S e t o r *</Text>
  <TouchableOpacity style={styles.input} onPress={() => setModalVisible('setores')}>
    <Text style={form.setor ? styles.inputText : styles.inputPlaceholder}>
      {form.setor || "Selecione o setor"}
    </Text>
  </TouchableOpacity>

  <Text style={[styles.label, { color: '#1e8368ff' }]}>N o m e    d o    c o l a b o r a d o r</Text>
  <TextInput
    style={styles.input}
    value={form.nomeColaborador}
    onChangeText={(text) => updateForm('nomeColaborador', text)}
  />

  <Text style={[styles.label, { color: '#2f1c90ff' }]}>F a m í l i a *</Text>
  <TouchableOpacity style={styles.input} onPress={() => setModalVisible('familias')}>
    <Text style={form.familia ? styles.inputText : styles.inputPlaceholder}>
      {form.familia || "Selecione a família"}
    </Text>
  </TouchableOpacity>

  <Text style={[styles.label, { color: '#520983ff' }]}>T i p o *</Text>
  <TouchableOpacity style={styles.input} onPress={() => setModalVisible('tipos')}>
    <Text style={form.tipo ? styles.inputText : styles.inputPlaceholder}>
      {form.tipo || "Selecione o tipo"}
    </Text>
  </TouchableOpacity>

  <Text style={[styles.label, { color: '#7d580eff' }]}>D e s c r i ç ã o    d o    p r o d u t o</Text>
  <TextInput
    style={styles.input}
    value={form.descricao}
    onChangeText={(text) => updateForm('descricao', text)}
  />

  <Text style={[styles.label, { color: '#8b0932ff' }]}>M a r c a *</Text>
  <TouchableOpacity style={styles.input} onPress={() => setModalVisible('marcas')}>
    <Text style={form.marca ? styles.inputText : styles.inputPlaceholder}>
      {form.marca || "Selecione a marca"}
    </Text>
  </TouchableOpacity>

  <Text style={[styles.label, { color: '#416d0eff' }]}>M o d e l o</Text>
  <TextInput
    style={styles.input}
    value={form.modelo}
    onChangeText={(text) => updateForm('modelo', text)}
  />

  <Text style={[styles.label, { color: '#765805ff' }]}>N°    d e    s é r i e</Text>
  <TextInput
    style={styles.input}
    value={form.numeroSerie}
    onChangeText={(text) => updateForm('numeroSerie', text)}
  />

  <Text style={[styles.label, { color: '#2e4f0bff' }]}>I m e i  1</Text>
  <TextInput
    style={styles.input}
    value={form.imei1}
    onChangeText={(text) => updateForm('imei1', text)}
  />

  <Text style={[styles.label, { color: '#174a6fff' }]}>I m e i  2</Text>
  <TextInput
    style={styles.input}
    value={form.imei2}
    onChangeText={(text) => updateForm('imei2', text)}
  />

  <Text style={[styles.label, { color: '#154b0cff' }]}>S t a t u s    d o    p r o d u t o *</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={form.statusProduto}
      onValueChange={(itemValue) => updateForm('statusProduto', itemValue)}
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
    <Text style={styles.saveButtonText}>Editar</Text>
  </TouchableOpacity>


            <View style={{ height: 50 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SearchableModal
        visible={!!modalVisible}
        onClose={() => {
          setModalVisible(null);
          setSearchText('');
        }}
        options={modalVisible ? getFilteredOptions(modalVisible) : []}
        search={searchText}
        setSearch={setSearchText}
        title={
          modalVisible === 'setores' ? 'Selecione o Setor' :
          modalVisible === 'familias' ? 'Selecione a Família' :
          modalVisible === 'tipos' ? 'Selecione o Tipo' :
          modalVisible === 'marcas' ? 'Selecione a Marca' : 'Selecione'
        }
        onSelect={(item) => {
          // Mapeia o nome da lista (plural) para o campo do banco (singular)
          const fieldMap = {
            setores: 'setor',
            familias: 'familia',
            tipos: 'tipo',
            marcas: 'marca'
          };
          handleSelectOption(fieldMap[modalVisible], item);
        }}
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
    backgroundColor: '#1f5691',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  

  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: { fontSize: 16 },
});