import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { STORAGE_KEYS, IGNORE_TAGS } from '../constants/index'; // Supondo que criou acima
import SearchableModal from '../src/components/SearchableModal';
import { useMemo } from 'react';
const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';


export default function CadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
   const [osId, setOsId] = useState(null);
   const [pedidoNumero, setPedidoNumero] = useState(null);

    const [codigoFinal, setCodigoFinal] = useState(null);
    
   const [nomeCliente, setNomeCliente] = useState('');
   const [setor, setSetor] = useState('');
   const [familia, setFamilia] = useState('');
   const [tipo, setTipo] = useState('');
   const [marca, setMarca] = useState('');
   const [nomeColaborador, setNomeColaborador] = useState('');
   const [descricao, setDescricao] = useState('');
   const [modelo, setModelo] = useState('');
   const [numeroSerie, setNumeroSerie] = useState('');
   const [imei1, setImei1] = useState('');
   const [imei2, setImei2] = useState('');
   const [selectedStatus, setSelectedStatus] = useState('');

const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);

  const [isFamiliaModalVisible, setIsFamiliaModalVisible] = useState(false);

  const [isTipoModalVisible, setIsTipoModalVisible] = useState(false);

  const [isMarcaModalVisible, setIsMarcaModalVisible] = useState(false);


   // --- 🚀 CORREÇÃO 1: Estados para CADA foto ---
   const [fotoFrenteUri, setFotoFrenteUri] = useState(null);
   const [fotoLateralUri, setFotoLateralUri] = useState(null);
   const [fotoQrcodeUri, setFotoQrcodeUri] = useState(null);
    const [fotoQrcodeUri2, setFotoQrcodeUri2] = useState(null);

   const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions({ writeOnly: true });
   const [isSaving, setIsSaving] = useState(false);


const [fotos, setFotos] = useState({
    frente: null,
    lateral: null,
    qrcode: null,
    qrcode2: null
  });

  // Estados de Opções (Dropdowns)
  const [options, setOptions] = useState({ setores: [], familias: [], tipos: [], marcas: [] });
  const [searchText, setSearchText] = useState({ setor: '', familia: '', tipo: '', marca: '' });

  const params = useLocalSearchParams();
   const { tag } = params; // 'tag' do cliente (se vier da tela anterior)


  // --- HOOK 1: Carregar Opções da API (Executa uma vez) ---
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
        Alert.alert('Erro', 'Falha ao carregar listas de seleção.');
      }
    };
    fetchOptions();
  }, []);

  // --- HOOK 2: Logica de Tag/Scanner ---
  useEffect(() => {
    const tagRecebida = params.tag || params.etiqueta;
    if (tagRecebida && !IGNORE_TAGS.includes(tagRecebida)) {
      console.log("✅ Tag fixada:", tagRecebida);
      setCodigoFinal(tagRecebida);
    }
  }, [params.tag, params.etiqueta]);

  // --- HOOK 3: Carregar Fotos Pendentes e Dados Anteriores ---
  useFocusEffect(
    useCallback(() => {
      const loadPersistedData = async () => {
        try {
          // 1. Carregar Fotos
          const [frente, lateral, qrcode, qrcode2] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.FOTO_FRENTE),
            AsyncStorage.getItem(STORAGE_KEYS.FOTO_LATERAL),
            AsyncStorage.getItem(STORAGE_KEYS.QRCODE),
            AsyncStorage.getItem(STORAGE_KEYS.QRCODE2),
          ]);
          
          setFotos(prev => ({
            ...prev,
            frente: frente || prev.frente,
            lateral: lateral || prev.lateral,
            qrcode: qrcode || prev.qrcode,
            qrcode2: qrcode2 || prev.qrcode2
          }));

          // 2. Carregar Últimos Dados Salvos (Preenchimento automático)
          const keys = [
            STORAGE_KEYS.LAST_SETOR, STORAGE_KEYS.LAST_FAMILIA, 
            STORAGE_KEYS.LAST_TIPO, STORAGE_KEYS.LAST_MARCA, 
            STORAGE_KEYS.LAST_STATUS, STORAGE_KEYS.LAST_COLABORADOR,
            STORAGE_KEYS.LAST_CLIENTE, STORAGE_KEYS.LAST_DESCRICAO
          ];
          
          const stores = await AsyncStorage.multiGet(keys);
          const data = Object.fromEntries(stores); // Converte array de arrays em objeto

          if (data[STORAGE_KEYS.LAST_SETOR]) setSetor(data[STORAGE_KEYS.LAST_SETOR]);
          if (data[STORAGE_KEYS.LAST_FAMILIA]) setFamilia(data[STORAGE_KEYS.LAST_FAMILIA]);
          if (data[STORAGE_KEYS.LAST_TIPO]) setTipo(data[STORAGE_KEYS.LAST_TIPO]);
          if (data[STORAGE_KEYS.LAST_MARCA]) setMarca(data[STORAGE_KEYS.LAST_MARCA]);
          if (data[STORAGE_KEYS.LAST_STATUS]) setSelectedStatus(data[STORAGE_KEYS.LAST_STATUS]);
          if (data[STORAGE_KEYS.LAST_COLABORADOR]) setNomeColaborador(data[STORAGE_KEYS.LAST_COLABORADOR]);
          if (data[STORAGE_KEYS.LAST_DESCRICAO]) setDescricao(data[STORAGE_KEYS.LAST_DESCRICAO]);

          // Lógica do Cliente (Prioridade: Params > Storage)
          if (params.nomeCliente && params.nomeCliente !== 'null') {
            setNomeCliente(params.nomeCliente);
          } else if (data[STORAGE_KEYS.LAST_CLIENTE]) {
            setNomeCliente(data[STORAGE_KEYS.LAST_CLIENTE]);
          }

        } catch (e) {
          console.error("Erro ao carregar dados persistidos:", e);
        }
      };
      
      loadPersistedData();
    }, [params.nomeCliente])
  );

  // --- FILTROS OTIMIZADOS (Substitui os 4 useEffects) ---
  const filteredSetores = useMemo(() => 
    options.setores.filter(o => o.toLowerCase().includes(searchText.setor.toLowerCase())), 
  [options.setores, searchText.setor]);

  const filteredFamilias = useMemo(() => 
    options.familias.filter(o => o.toLowerCase().includes(searchText.familia.toLowerCase())), 
  [options.familias, searchText.familia]);

  const filteredTipos = useMemo(() => 
    options.tipos.filter(o => o.toLowerCase().includes(searchText.tipo.toLowerCase())), 
  [options.tipos, searchText.tipo]);

  const filteredMarcas = useMemo(() => 
    options.marcas.filter(o => o.toLowerCase().includes(searchText.marca.toLowerCase())), 
  [options.marcas, searchText.marca]);


  // --- FUNÇÕES DE SELEÇÃO (Para corrigir o erro) ---
  
  const onSelectSetor = (item) => {
    setSetor(item);
    setIsSetorModalVisible(false);
    setSearchText(prev => ({ ...prev, setor: '' })); // Limpa a busca do setor
  };

  const onSelectFamilia = (item) => {
    setFamilia(item);
    setIsFamiliaModalVisible(false);
    setSearchText(prev => ({ ...prev, familia: '' })); // Limpa a busca da familia
  };

  const onSelectTipo = (item) => {
    setTipo(item);
    setIsTipoModalVisible(false);
    setSearchText(prev => ({ ...prev, tipo: '' })); // Limpa a busca do tipo
  };

  const onSelectMarca = (item) => {
    setMarca(item);
    setIsMarcaModalVisible(false);
    setSearchText(prev => ({ ...prev, marca: '' }));
  };


  // --- FUNÇÃO DE SALVAR ---
const handleSalvar = async () => {
    if (isSaving) return;

    // BLINDAGEM: Tenta pegar do State, se falhar pega direto do Params
    const currentOsId = osId || params.osId;
    const currentPedido = pedidoNumero || params.pedidoNumero;
    const tagParaSalvar = codigoFinal || params.tag || params.etiqueta;

    if (!currentOsId || !currentPedido) {
        console.log("ERRO CRÍTICO: Params:", params, "State:", { osId, pedidoNumero });
        return Alert.alert('Erro', 'Dados de navegação (OS ou Pedido) perdidos. Tente voltar e entrar novamente.');
    }

    if (!tagParaSalvar) return Alert.alert('Atenção', 'Nenhuma TAG identificada.');

    if (!nomeCliente || !selectedStatus || !setor || !familia || !tipo || !marca) {
      return Alert.alert('Erro', 'Preencha os campos obrigatórios (*).');
    }

    setIsSaving(true);

    try {
      // Aplicando toUpperCase() com Optional Chaining (?.) para segurança
      const payload = {
        osId: currentOsId, // Geralmente IDs não precisam de UpperCase, mas se for string, pode adicionar ?.toUpperCase()
        pedidoNumero: currentPedido?.toUpperCase(),
        tagCliente: tagParaSalvar?.toUpperCase(),
        tagAntiga: params.tagAntiga?.toUpperCase(),
        nomeCliente: nomeCliente?.toUpperCase(), 
        setor: setor?.toUpperCase(), 
        nomeColaborador: nomeColaborador?.toUpperCase(), 
        familia: familia?.toUpperCase(), 
        tipo: tipo?.toUpperCase(), 
        descricao: descricao?.toUpperCase(), 
        marca: marca?.toUpperCase(),
        statusProduto: selectedStatus?.toUpperCase(),
        modelo: modelo?.toUpperCase() || null,
        numeroSerie: numeroSerie?.toUpperCase() || null,
      }
    
      await axios.post(`${API_BASE_URL}/api/inventario`, payload);

      const fotosArray = Object.values(fotos).filter(uri => uri);
      if (fotosArray.length > 0) {
        const perm = await (galleryPermission?.granted ? Promise.resolve({ granted: true }) : requestGalleryPermission());
        if (perm.granted) {
          await Promise.all(fotosArray.map(uri => MediaLibrary.saveToLibraryAsync(uri)));
        }
      }


      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_SETOR, setor?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_FAMILIA, familia?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_TIPO, tipo?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_MARCA, marca?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_STATUS, selectedStatus?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_COLABORADOR, nomeColaborador?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_CLIENTE, nomeCliente?.toUpperCase() || ''],
        [STORAGE_KEYS.LAST_DESCRICAO, descricao?.toUpperCase() || '']]);

      // Salvar Preferências
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_SETOR, setor],
        [STORAGE_KEYS.LAST_FAMILIA, familia],
        [STORAGE_KEYS.LAST_TIPO, tipo],
        [STORAGE_KEYS.LAST_MARCA, marca],
        [STORAGE_KEYS.LAST_STATUS, selectedStatus],
        [STORAGE_KEYS.LAST_COLABORADOR, nomeColaborador || ''],
        [STORAGE_KEYS.LAST_CLIENTE, nomeCliente || ''],
        [STORAGE_KEYS.LAST_DESCRICAO, descricao || '']

      ]);

      // Limpar Fotos Pendentes
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.FOTO_FRENTE, STORAGE_KEYS.FOTO_LATERAL,
        STORAGE_KEYS.QRCODE, STORAGE_KEYS.QRCODE2
      ]);

      Alert.alert('Sucesso!', 'Item cadastrado com sucesso.', [
        { 
          text: 'OK', 
          onPress: () => router.replace({
            pathname: "home",
            params: { osId: currentOsId, pedidoNumero: currentPedido, cliente: params.cliente }
          })
        }
      ]);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', `Falha ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

const renderMiniatura = (uri, label) => {
    if (!uri) return null;
    return (
      <View style={styles.fotoContainer}>
        <Image source={{ uri: uri }} style={styles.fotoThumb} />
        <Text style={styles.fotoLabel}>{label}</Text>
      </View>
    );
  };


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cadastro de Inventário</Text>
            </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}>


        <ScrollView                                                                                   
          contentContainerStyle={styles.scrollContent}                                             
          keyboardShouldPersistTaps="handled"  
          showsVerticalScrollIndicator={false}
        >   
          <View style={styles.formContainer}>

            
<View style={styles.fotosSection}>

  <ScrollView horizontal showsHorizontalScrollIndicator={false}>

    {renderMiniatura(fotoQrcodeUri, "FOTO QRCODE")}
    {renderMiniatura(fotoQrcodeUri2, "FOTO QRCODE2")}
    {renderMiniatura(fotoFrenteUri, "FOTO FRENTE")}
    {renderMiniatura(fotoLateralUri, "FOTO LATERAL")}
    
    {!fotoQrcodeUri && !fotoQrcodeUri2 && !fotoFrenteUri && !fotoLateralUri && (
       <Text style={{ color: '#999', fontStyle: 'italic', padding: 10 }}>
         Nenhuma foto anexada ainda.
       </Text>
    )}
  </ScrollView>
</View>

            <Text style={[styles.label, { color: '#000' }]}>T a g    d o    c l i e n t e</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              placeholderTextColor="#757575ff"
              value={codigoFinal || 'Aguardando leitura...'}
              editable={false}
            />


            <Text style={[styles.label, { color: '#4c6d09ff' }]}>N o m e    d o    c l i e n t e *</Text>
            <TextInput
              style={styles.input}
              placeholder="N o m e   d o    c l i e n t e"
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

          <Text style={[styles.label, { color: '#1e8368ff' }]}>N o m e   d o    c o l a b o r a d o r</Text>
          <TextInput
            style={styles.input}
            placeholder="N o m e  d o  c o l a b o r a d o "
            placeholderTextColor="#757575ff"
            value={nomeColaborador}
            onChangeText={setNomeColaborador}
          />

          <Text style={[styles.label, { color: '#2f1c90ff' }]}>F a m í l i a *</Text>
          
          <TouchableOpacity style={styles.input} onPress={() => setIsFamiliaModalVisible(true)}>
          <Text style={familia ? styles.inputText : styles.inputPlaceholder}>
              {familia || "S e l e c i o n e  a  f a m í l i a"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: '#520983ff' }]}>T i p o *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsTipoModalVisible(true)}>
            <Text style={tipo ? styles.inputText : styles.inputPlaceholder}>
              {tipo || "S e l e c i o n e   o   t i p o"}
            </Text>
          </TouchableOpacity>
        
          <Text style={[styles.label, { color: '#7d580eff' }]}>D e s c r i ç ã o   do   p r o d u t o</Text>
          <TextInput
            style={styles.input}
            placeholder="D e s c r i ç ã o  do   p r o d u t o"
            placeholderTextColor="#757575ff"
            value={descricao}
            onChangeText={setDescricao}
          />
          
          <Text style={[styles.label, { color: '#8b0932ff' }]}>M a r c a *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsMarcaModalVisible(true)}>
            <Text style={marca ? styles.inputText : styles.inputPlaceholder}>
              {marca || "S e l e c i o n e  a  m a r c a"}
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
          
          <Text style={[styles.label, { color: '#765805ff' }]}>N°   d e   s é r i e</Text>
          <TextInput
            style={styles.input}
            placeholder="N°   d e   s é r i e"
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
          
          <Text style={[styles.label, { color: '#154b0cff' }]}>S t a t u s  d o  p r o d u t o *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              
              <Picker.Item label="S e l e c i o n e   u m   s t a t u s" value="" color="#757575ff" />

              <Picker.Item label="Novo na caixa" value="NOVO" color="#000" />
              <Picker.Item label="Normal em uso" value="NORMAL EM USO" color="#000" />
              <Picker.Item label="Defeito em uso" value="DEFEITO EM USO" color="#000" />
              <Picker.Item label="Sucata" value="SUCATA" color="#000" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>

      <View style={{ height: 30 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

        <SearchableModal
          visible={isSetorModalVisible}
          onClose={() => setIsSetorModalVisible(false)}
          options={filteredSetores} 
          onSelect={onSelectSetor} 
          title="Selecione o Setor"
          search={searchText.setor} 
          setSearch={(text) => setSearchText(prev => ({ ...prev, setor: text }))} 
        />

        {/* --- FAMÍLIA --- */}
        <SearchableModal
          visible={isFamiliaModalVisible}
          onClose={() => setIsFamiliaModalVisible(false)}
          options={filteredFamilias} // Variável do useMemo
          onSelect={onSelectFamilia}
          title="Selecione a Família"
          search={searchText.familia}
          setSearch={(text) => setSearchText(prev => ({ ...prev, familia: text }))}
        />

        {/* --- TIPO --- */}
        <SearchableModal
          visible={isTipoModalVisible}
          onClose={() => setIsTipoModalVisible(false)}
          options={filteredTipos} // Variável do useMemo
          onSelect={onSelectTipo}
          title="Selecione o Tipo"
          search={searchText.tipo}
          setSearch={(text) => setSearchText(prev => ({ ...prev, tipo: text }))}
        />

        <SearchableModal
          visible={isMarcaModalVisible}
          onClose={() => setIsMarcaModalVisible(false)}
          options={filteredMarcas}
          onSelect={onSelectMarca}
          title="Selecione a Marca"
          search={searchText.marca}
          setSearch={(text) => setSearchText(prev => ({ ...prev, marca: text }))}
        />

    </>
  );
}


const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20, // Espaço extra no fundo
  },
  formContainer: {
    padding: 20,
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffffff',
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
    paddingVertical: 14,
    fontSize: 18,
    color: '#0c0c0c',
    justifyContent: 'center',
  },
  readOnlyInput: {
    backgroundColor: '#e9e9e9',
    color: '#555',
  },
  inputText: {
    fontSize: 18,
    color: '#0c0c0c',
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
    backgroundColor: '#125826',
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
    fontSize: 20,
    fontWeight: 'bold',
  },

  fotosSection: {
    marginTop: 20,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  fotoContainer: {
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fotoThumb: {
    width: 80,  // Tamanho da miniatura
    height: 80,
    borderRadius: 4,
    resizeMode: 'cover',
    marginBottom: 5,
  },
  fotoLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },

});