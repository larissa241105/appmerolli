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
  Modal,
  FlatList,
  Button,
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

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';


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
        <SafeAreaProvider style={styles.modalContainer}>
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
        </SafeAreaProvider>
      </View>
    </Modal>
  );
};


export default function CadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
   const [osId, setOsId] = useState(null);
   const [pedidoNumero, setPedidoNumero] = useState(null);

    const [codigoFinal, setCodigoFinal] = useState(null);

   const [nossaTag, setNossaTag] = useState('');
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

   const params = useLocalSearchParams();
   const { tag } = params; // 'tag' do cliente (se vier da tela anterior)

const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);

//Setor
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

   // --- 🚀 CORREÇÃO 1: Estados para CADA foto ---
   const [fotoFrenteUri, setFotoFrenteUri] = useState(null);
   const [fotoLateralUri, setFotoLateralUri] = useState(null);
   const [fotoQrcodeUri, setFotoQrcodeUri] = useState(null);
    const [fotoQrcodeUri2, setFotoQrcodeUri2] = useState(null);

   const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions({ writeOnly: true });
   const [isSaving, setIsSaving] = useState(false);


   useEffect(() => {
    // Tenta pegar o valor de 'tag' (do scanner) ou 'etiqueta' (da câmera)
    const codigoRecebido = params.tag || params.etiqueta;

    // Lista de valores que NÃO SÃO códigos de cliente
    const COMANDOS_IGNORAR = [
      'FOTO_QRCODE', 
      'FOTO_FRENTE', 
      'FOTO_LATERAL', 
      'FOTO_QRCODE2', 
      'null', 
      'undefined', 
      ''
    ];

    // Só atualiza o estado se for um código válido
    if (codigoRecebido && !COMANDOS_IGNORAR.includes(codigoRecebido)) {
      console.log("✅ Cadastro - Tag do Cliente fixada:", codigoRecebido);
      setCodigoFinal(codigoRecebido);
    }
  }, [params]);



  


   // --- 🚀 CORREÇÃO 2: useFocusEffect para carregar TODAS as fotos ---
   useFocusEffect(
     useCallback(() => {
        const carregarFotosPendentes = async () => {
          try {
             // Lista de chaves que esperamos do AsyncStorage
             const tags = [
               { key: 'FOTO_FRENTE', setter: setFotoFrenteUri },
               { key: 'FOTO_LATERAL', setter: setFotoLateralUri },
               { key: 'FOTO_QRCODE2', setter: setFotoQrcodeUri2 },
               { key: 'FOTO_QRCODE', setter: setFotoQrcodeUri },
             ];

             for (const item of tags) {
               // Verifica se a foto existe no AsyncStorage
               const uri = await AsyncStorage.getItem(item.key);
               if (uri) {
                  console.log(`Foto pendente encontrada (${item.key}):`, uri);
                  item.setter(uri); // Atualiza o estado (ex: setFotoFrenteUri)
                  await AsyncStorage.removeItem(item.key); // Limpa
               }
             }
          } catch (e) {
             console.error("Erro ao buscar fotos pendentes:", e);
          }
        };

        carregarFotosPendentes();
     }, []) // Dependências vazias, roda a cada foco
   );


  
  // --- Efeito para buscar parâmetros da rota ---
useEffect(() => {
     console.log('Parâmetros recebidos da navegação:', params);
     if (params.osId) setOsId(params.osId);
     if (params.pedidoNumero) setPedidoNumero(params.pedidoNumero);
   }, [params]);

   // --- Efeito para buscar dados das APIs (Seu código original) ---
   useEffect(() => {
     const fetchData = async () => {
        try {
          // (Sua lógica de buscar Setores, Familias, Tipos, Marcas)
          console.log("Buscando dados das APIs...");
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          Alert.alert('Erro de Rede', 'Não foi possível carregar os dados.');
        }
     };
     fetchData();
   }, []);

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


  useEffect(() => {
    const carregarUltimosDados = async () => {
      try {
        // Recupera os valores salvos
        const lastSetor = await AsyncStorage.getItem('last_setor');
        const lastFamilia = await AsyncStorage.getItem('last_familia');
        const lastTipo = await AsyncStorage.getItem('last_tipo');
        const lastMarca = await AsyncStorage.getItem('last_marca');
        const lastStatus = await AsyncStorage.getItem('last_status');
        const lastColaborador = await AsyncStorage.getItem('last_colaborador');
        const lastDescricao = await AsyncStorage.getItem('last_descricao');
        const lastCliente = await AsyncStorage.getItem('last_cliente');

        if (lastSetor) setSetor(lastSetor);
        if (lastFamilia) setFamilia(lastFamilia);
        if (lastTipo) setTipo(lastTipo);
        if (lastMarca) setMarca(lastMarca);
        if (lastStatus) setSelectedStatus(lastStatus);
        if (lastColaborador) setNomeColaborador(lastColaborador);  
        if (lastCliente) setNomeCliente(lastCliente);
         if (lastDescricao) setDescricao(lastDescricao);

         if (params.nomeCliente && params.nomeCliente !== 'null') {
            setNomeCliente(params.nomeCliente);
            console.log("Nome do cliente carregado via parâmetros:", params.nomeCliente);
        } 
        // 2. Se não veio parâmetro, usa o último salvo (Fallback)
        else if (lastCliente) {
            setNomeCliente(lastCliente);
            console.log("Nome do cliente recuperado do histórico:", lastCliente);
        }
        // 3. Se não tiver nenhum, fica vazio para digitação manual
        
        console.log("Dados do último cadastro recuperados/verificados com sucesso!");
      } catch (e) {
        console.error("Erro ao recuperar dados anteriores:", e);
      }
    };

    carregarUltimosDados();
    // Adicione params.nomeCliente nas dependências para garantir atualização se a rota mudar
  }, [params.nomeCliente]);
      

  
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


  
  const onSelectSetor = (item) => {
    setSetor(item);
    setIsSetorModalVisible(false);
    setSetorSearch(''); 
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
    if (isSaving) return;

    const osIdFinal = osId;
    const pedidoNumeroFinal = pedidoNumero;
    const tagParaSalvar = codigoFinal || params.tag || params.etiqueta;

    if (!osIdFinal || !pedidoNumeroFinal) {
      Alert.alert('Erro', 'Dados de navegação perdidos.');
      return;
    }

    if (!tagParaSalvar) {
       Alert.alert('Atenção', 'Nenhuma TAG identificada.');
       return;
    }

    if (!nomeCliente || !selectedStatus || !setor || !familia || !tipo || !marca) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios (*).');
      return;
    }

    setIsSaving(true);

    const payload = {
      osId: osIdFinal,
      pedidoNumero: pedidoNumeroFinal,
      tagCliente: tagParaSalvar,
      nossaTag: nossaTag ? nossaTag : null,
      nomeCliente,
      setor,
      nomeColaborador,
      familia,
      tipo,
      descricao,
      marca,
      modelo: modelo ? modelo : null,
      numeroSerie: numeroSerie ? numeroSerie : null,
      imei1: imei1 ? imei1 : null,
      imei2: imei2 ? imei2 : null,
      statusProduto: selectedStatus,
    };

    try {

      await axios.post(`${API_BASE_URL}/api/inventario`, payload);

      let mensagemSucesso = 'Item cadastrado com sucesso!';


      const fotos = [fotoFrenteUri, fotoLateralUri, fotoQrcodeUri2, fotoQrcodeUri];
      const fotosParaSalvar = fotos.filter(uri => uri);

      if (fotosParaSalvar.length > 0) {
        if (galleryPermission?.granted || (await requestGalleryPermission()).granted) {
            for (const uri of fotosParaSalvar) {
              await MediaLibrary.saveToLibraryAsync(uri);
            }
            mensagemSucesso += ' (Fotos salvas).';
        }
      }

      await AsyncStorage.multiSet([
        ['last_setor', setor],
        ['last_familia', familia],
        ['last_tipo', tipo],
        ['last_marca', marca],
        ['last_status', selectedStatus],
        ['last_colaborador', nomeColaborador || ''], 
        ['last_cliente', nomeCliente || ''],
        ['last_descricao', descricao || '']
      ]);
      console.log("Preferências salvas para o próximo item!");

      Alert.alert('Sucesso!', mensagemSucesso, [
        { 
          text: 'OK', 
          onPress: () => {
            router.replace({
                pathname: "home",
                params: { 
                    osId: osIdFinal,
                    pedidoNumero: pedidoNumeroFinal,
                    cliente: params.cliente, 
                    
                    tag: null, 
                    etiqueta: null 
                }
            });
          } 
        }
      ]);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Falha ao salvar: ' + error.message);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent} // Mudança aqui: use contentContainerStyle
          keyboardShouldPersistTaps="handled" // Importante para o botão funcionar de primeira
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

            <Text style={[styles.label, { color: '#9c2a2aff' }]}>N o s s a    t a g *</Text>
            <TextInput
              style={styles.input}
              placeholder="N o s s a  t a g"
              placeholderTextColor="#757575ff"
              value={nossaTag}
              onChangeText={setNossaTag}
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
              <Picker.Item label="Novo na caixa" value="novo" color="#000" />
              <Picker.Item label="Normal em uso" value="normal_em_uso" color="#000" />
              <Picker.Item label="Defeito em uso" value="defeito_em_uso" color="#000" />
              <Picker.Item label="Sucata" value="sucata" color="#000" />
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