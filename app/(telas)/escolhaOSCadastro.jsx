import React, { useState, useEffect, useMemo } from 'react';
import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, FlatList, Pressable, 
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';


const normalizar = (valor) => {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
};


const SelectorModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  labelKey,
  valueKey, 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {options.length === 0 ? (
          <View style={styles.modalEmptyContainer}>
            <Text style={styles.modalEmptyText}>Nenhuma opção disponível.</Text>
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => String(item[valueKey])}
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item[valueKey]); 
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item[labelKey]}</Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};


const PickerDisplay = ({ label, value, onPress, disabled, placeholder }) => {
  const displayValue = value ? String(value) : placeholder;
  const textStyle = value ? styles.pickerDisplayText : styles.pickerPlaceholderText;

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={textStyle}>{displayValue}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function EscolhaOSCadastro() {
  const router = useRouter();

      const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [navegando, setNavegando] = useState(false);
  const [listaPedidosUnidades, setListaPedidosUnidades] = useState([]);
  const [listaOSProdutos, setListaOSProdutos] = useState([]);

  const [selecoes, setSelecoes] = useState({
    cliente: "",
    pedido: "",
    unidade: "",
    os: "",
  });

  const [modalState, setModalState] = useState({
    visible: false,
    type: null, 
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resPedidos, resOS] = await Promise.all([
          axios.get(`${API_BASE_URL}/visualizarpedido`),
          axios.get(`${API_BASE_URL}/visualizarosproduto`),
        ]);
        setListaPedidosUnidades(Array.isArray(resPedidos.data) ? resPedidos.data : []);
        setListaOSProdutos(Array.isArray(resOS.data) ? resOS.data : []);
      } catch (error) {
        console.error("❌ Erro ao buscar dados:", error);
        Alert.alert("Erro de Conexão", "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const listaClientes = useMemo(() => {
    const map = new Map();
    listaPedidosUnidades.forEach(item => {
      if (!item) return;
      const cnpj = normalizar(item.cnpj_cliente);
      const razao = normalizar(item.razao_social);
      if (cnpj && razao) {
        map.set(cnpj, razao);
      }
    });
    return Array.from(map, ([cnpj, razao]) => ({
      value: cnpj,
      label: razao,
    }));
  }, [listaPedidosUnidades]);
  

  const clienteMap = useMemo(() => {
    return new Map(listaClientes.map(c => [c.value, c.label]));
  }, [listaClientes]);

  const listaPedidos = useMemo(() => {
    if (!selecoes.cliente) return [];
    const pedidosSet = new Set();
    listaPedidosUnidades.forEach(item => {
      if (!item) return;
      const cnpj = normalizar(item.cnpj_cliente);
      const pedido = normalizar(item.numeropedido);
      if (cnpj === selecoes.cliente && pedido) {
        pedidosSet.add(pedido);
      }
    });
    return Array.from(pedidosSet).sort().map(p => ({ value: p, label: p }));
  }, [selecoes.cliente, listaPedidosUnidades]);

  const listaUnidades = useMemo(() => {
    if (!selecoes.pedido) return [];
    const unidadesSet = new Set();
    listaPedidosUnidades.forEach(item => {
      if (!item) return;
      const pedido = normalizar(item.numeropedido);
      const unidade = normalizar(item.unidade_nome);
      if (pedido === selecoes.pedido && unidade) {
        unidadesSet.add(unidade);
      }
    });
    return Array.from(unidadesSet).sort().map(u => ({ value: u, label: u }));
  }, [selecoes.pedido, listaPedidosUnidades]);

  const listaOrdensServico = useMemo(() => {
    if (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade) {
      return [];
    }
    const osMap = new Map();
    listaOSProdutos.forEach((os) => {
      if (!os || os.id_os == null || os.id_os === '') return;

      const cnpj = normalizar(os.cnpj_cliente);
      const unidade = normalizar(os.unidade_cliente);
      const pedido = normalizar(os.numero_pedido_origem);

      if (
        cnpj === selecoes.cliente &&
        unidade === selecoes.unidade &&
        pedido === selecoes.pedido
      ) {
        const idOS = normalizar(os.id_os);
        const numeroOS = normalizar(os.numero_os) || `OS ${idOS}`;
        if (idOS) {
          osMap.set(idOS, { value: idOS, label: numeroOS });
        }
      }
    });
    return Array.from(osMap.values());
  }, [selecoes.cliente, selecoes.pedido, selecoes.unidade, listaOSProdutos]);

  
  const osMap = useMemo(() => {
    return new Map(listaOrdensServico.map(os => [os.value, os.label]));
  }, [listaOrdensServico]);



  const handleSelect = (type, value) => {
    const valorNorm = normalizar(value);
    
    switch (type) {
      case 'cliente':
        console.log(`SELECIONADO CLIENTE: ${valorNorm}`);
        setSelecoes({ cliente: valorNorm, pedido: "", unidade: "", os: "" });
        break;
      case 'pedido':
        console.log(`SELECIONADO PEDIDO: ${valorNorm}`);
        setSelecoes(prev => ({ ...prev, pedido: valorNorm, unidade: "", os: "" }));
        break;
      case 'unidade':
        console.log(`SELECIONADO UNIDADE: ${valorNorm}`);
        setSelecoes(prev => ({ ...prev, unidade: valorNorm, os: "" }));
        break;
      case 'os':
        console.log(`SELECIONADO OS: ${valorNorm}`);
        setSelecoes(prev => ({ ...prev, os: valorNorm }));
        break;
    }

    setModalState({ visible: false, type: null });
  };


  const openModal = (type) => {
    if (navegando) return;
    setModalState({ visible: true, type: type });
  };


  const getModalData = () => {
    switch (modalState.type) {
      case 'cliente':
        return {
          title: 'Selecione o Cliente',
          options: listaClientes,
          labelKey: 'label',
          valueKey: 'value',
        };
      case 'pedido':
        return {
          title: 'Selecione o Pedido',
          options: listaPedidos,
          labelKey: 'label',
          valueKey: 'value',
        };
      case 'unidade':
        return {
          title: 'Selecione a Unidade',
          options: listaUnidades,
          labelKey: 'label',
          valueKey: 'value',
        };
      case 'os':
        return {
          title: 'Selecione a OS',
          options: listaOrdensServico,
          labelKey: 'label',
          valueKey: 'value',
        };
      default:
        return { title: '', options: [], labelKey: 'label', valueKey: 'value' };
    }
  };

  const handleSalvar = () => {

    try {
      if (navegando) return;
      const { cliente, pedido, unidade, os } = selecoes;
      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções.");
        return;
      }

      const osValida = osMap.has(os);
      if (!osValida) {
        console.error("❌ OS não encontrada no Map:", os);
        Alert.alert("Erro", "A OS selecionada não é mais válida. Tente novamente.");
        return;
      }

      setNavegando(true);

      const params = {
        osId: String(os),
        cliente: String(cliente),
        unidadeNome: String(unidade),
        pedidoNumero: String(pedido)
      };

      console.log("📤 Navegando com params:", params);

      router.push({
        pathname: "home",
        params: params
      });
    

    } catch (error) {
      console.error("❌ Erro ao Salvar/Navegar:", error);
      Alert.alert("Erro", `Ocorreu um erro ao navegar: ${error.message}`);
      setNavegando(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  const modalData = getModalData();
  const isButtonDisabled = navegando || !selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os;

  return (
    <>
     <Stack.Screen options={{ headerShown: false }} />
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>O.S Cadastro</Text>
          </View>
      <SelectorModal
        visible={modalState.visible}
        onClose={() => setModalState({ visible: false, type: null })}
        title={modalData.title}
        options={modalData.options}
        onSelect={(value) => handleSelect(modalState.type, value)}
        labelKey={modalData.labelKey}
        valueKey={modalData.valueKey}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Vincular Ordem de Serviço</Text>


          <PickerDisplay
            label="1. Cliente"
            value={clienteMap.get(selecoes.cliente)} 
            placeholder="Selecione o Cliente"
            onPress={() => openModal('cliente')}
            disabled={navegando}
          />


          <PickerDisplay
            label="2. Pedido"
            value={selecoes.pedido}
            placeholder="Selecione o Pedido"
            onPress={() => openModal('pedido')}
            disabled={navegando || !selecoes.cliente || listaPedidos.length === 0}
          />


          <PickerDisplay
            label="3. Unidade"
            value={selecoes.unidade}
            placeholder="Selecione a Unidade"
            onPress={() => openModal('unidade')}
            disabled={navegando || !selecoes.pedido || listaUnidades.length === 0}
          />


          <PickerDisplay
            label="4. Ordem de Serviço"
            value={osMap.get(selecoes.os)}
            placeholder="Selecione a OS"
            onPress={() => openModal('os')}
            disabled={navegando || !selecoes.unidade || listaOrdensServico.length === 0}
          />


          <TouchableOpacity
            style={[
              styles.button,
              isButtonDisabled && styles.buttonDisabled
            ]}
            onPress={handleSalvar}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>
              {navegando ? "Carregando..." : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  

  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  pickerButtonDisabled: {
    backgroundColor: '#eee',
  },
  pickerDisplayText: {
    fontSize: 16,
    color: '#333',
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  pickerArrow: {
    fontSize: 16,
    color: '#777',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 18,
  },
  modalEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 18,
    color: '#999',
  },
  
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#99C9FF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontFamily: 'monospace',
  },
});