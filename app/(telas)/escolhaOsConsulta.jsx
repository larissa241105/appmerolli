import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  // --- NOVOS IMPORTS ---
  Modal,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
// ❌ REMOVIDO: import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

// ========================================
// COMPONENTE 1: O NOVO MODAL SELETOR (Reutilizável)
// ========================================
const SelectorModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  labelKey, // A chave do objeto a ser mostrada (ex: "razao_social")
  valueKey, // A chave do objeto a ser usada como valor (ex: "cnpj")
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
                  onSelect(item[valueKey]); // Envia apenas o valor (ex: o CNPJ)
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

// ========================================
// COMPONENTE 2: O DISPLAY DO PICKER (Reutilizável)
// ========================================
const PickerDisplay = ({ label, value, onPress, disabled, placeholder }) => {
  const displayValue = value ? String(value) : placeholder;
  const textStyle = value ? styles.pickerDisplayText : styles.pickerPlaceholderText;

  return (
    <View style={styles.pickerDisplayContainer}> 
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={textStyle} numberOfLines={1}>{displayValue}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// COMPONENTE 3: SEU COMPONENTE PRINCIPAL (Refatorado)
// ========================================
export default function EscolhaOSConsulta() {
  console.log("--- COMPONENTE RENDERIZOU ---");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listaPedidosUnidades, setListaPedidosUnidades] = useState([]);
  const [listaOSProdutos, setListaOSProdutos] = useState([]);

  const [selecoes, setSelecoes] = useState({
    cliente: "",
    pedido: "",
    unidade: "",
    os: "",
  });

  // --- NOVO ESTADO PARA O MODAL ---
  const [modalState, setModalState] = useState({
    visible: false,
    type: null, // 'cliente', 'pedido', 'unidade', 'os'
  });

  // ========================================
  // EFEITO PARA BUSCAR DADOS (Sem alterações)
  // ========================================
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
        console.error("Erro ao buscar dados:", error.message);
        Alert.alert("Erro de Conexão", "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ========================================
  // FUNÇÕES AUXILIARES (useCallback)
  // ========================================
  const normalizar = useCallback((valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor).trim();
  }, []);

  // ========================================
  // LISTAS MEMORIZADAS (useMemo)
  // Ajustadas para gerar { value, label } para o modal
  // ========================================
  
  const listaClientes = useMemo(() => {
    try {
      const map = new Map();
      listaPedidosUnidades.forEach(item => {
        if (!item) return;
        const cnpj = normalizar(item.cnpj_cliente);
        const razao = normalizar(item.razao_social);
        if (cnpj && razao) {
          map.set(cnpj, razao);
        }
      });
      // ✅ FORMATO { value, label }
      return Array.from(map, ([cnpj, razao]) => ({
        value: cnpj,
        label: razao,
      }));
    } catch (error) {
      console.error("Erro ao processar clientes:", error);
      return [];
    }
  }, [listaPedidosUnidades, normalizar]);

  // Map para buscar NOME do cliente pelo CNPJ (para o display)
  const clienteMap = useMemo(() => {
    return new Map(listaClientes.map(c => [c.value, c.label]));
  }, [listaClientes]);

  const listaPedidos = useMemo(() => {
    try {
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
      // ✅ FORMATO { value, label }
      return Array.from(pedidosSet).sort().map(p => ({ value: p, label: p }));
    } catch (error) {
      console.error("Erro ao processar pedidos:", error);
      return [];
    }
  }, [selecoes.cliente, listaPedidosUnidades, normalizar]);

  const listaUnidades = useMemo(() => {
    try {
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
      // ✅ FORMATO { value, label }
      return Array.from(unidadesSet).sort().map(u => ({ value: u, label: u }));
    } catch (error) {
      console.error("Erro ao processar unidades:", error);
      return [];
    }
  }, [selecoes.pedido, listaPedidosUnidades, normalizar]);

  const listaOrdensServico = useMemo(() => {
    try {
      if (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade) return [];
      
      const osMap = new Map();
      listaOSProdutos.forEach(os => {
        if (!os || os.id_os == null) return;
        
        const cnpj = normalizar(os.cnpj_cliente);
        const unidade = normalizar(os.unidade_cliente);
        const pedido = normalizar(os.numero_pedido_origem);
        
        if (cnpj === selecoes.cliente && 
            unidade === selecoes.unidade && 
            pedido === selecoes.pedido) {
          
          const idOS = normalizar(os.id_os);
          const numeroOS = normalizar(os.numero_os) || `OS ${idOS}`;
          
          if (idOS && !osMap.has(idOS)) {
            // ✅ FORMATO { value, label }
            osMap.set(idOS, { value: idOS, label: numeroOS });
          }
        }
      });
      return Array.from(osMap.values());
    } catch (error) {
      console.error("Erro ao processar OS:", error);
      return [];
    }
  }, [selecoes.cliente, selecoes.pedido, selecoes.unidade, listaOSProdutos, normalizar]);

  // Map para buscar NÚMERO da OS pelo ID (para o display)
  const osMap = useMemo(() => {
    return new Map(listaOrdensServico.map(os => [os.value, os.label]));
  }, [listaOrdensServico]);

  // ========================================
  // NOVOS HANDLERS (Simples e Síncronos)
  // ========================================
  
  // ❌ REMOVIDOS: handleClienteChange, handlePedidoChange, handleUnidadeChange, handleOSChange
  
  // ✅ NOVO: Handler unificado para todas as seleções
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

  // ✅ NOVO: Função para abrir o modal
  const openModal = (type) => {
    setModalState({ visible: true, type: type });
  };

  // ✅ NOVO: Função para configurar o modal
  const getModalData = () => {
    switch (modalState.type) {
      case 'cliente':
        return { title: 'Selecione o Cliente', options: listaClientes, labelKey: 'label', valueKey: 'value' };
      case 'pedido':
        return { title: 'Selecione o Pedido', options: listaPedidos, labelKey: 'label', valueKey: 'value' };
      case 'unidade':
        return { title: 'Selecione a Unidade', options: listaUnidades, labelKey: 'label', valueKey: 'value' };
      case 'os':
        return { title: 'Selecione a OS', options: listaOrdensServico, labelKey: 'label', valueKey: 'value' };
      default:
        return { title: '', options: [], labelKey: 'label', valueKey: 'value' };
    }
  };

  // ========================================
  // AÇÃO PRINCIPAL (handleConsultar)
  // (Mantido 100% como o seu - está correto)
  // ========================================
  const handleConsultar = useCallback(async () => {
    try {
      const { cliente, pedido, unidade, os } = selecoes;
      console.log("🔍 Iniciando consulta com:", { cliente, pedido, unidade, os });
      
      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções para consultar.");
        return;
      }

      // Validação extra (garante que a OS ainda existe no map)
      if (!osMap.has(os)) {
        Alert.alert("Erro", "A OS selecionada não é mais válida. Por favor, selecione novamente.");
        return;
      }

      const apiUrl = `${API_BASE_URL}/api/inventario/consulta?osId=${encodeURIComponent(os)}`;
      console.log("📡 Chamando API:", apiUrl);
      
      await axios.get(apiUrl);
      
      console.log("✅ API respondeu, navegando...");

      router.push({
        pathname: 'listadeProdutoInventario',
        params: { osId: os }
      });

    } catch (error) {
      console.error("❌ Erro na consulta:", error);
      if (error?.response?.status === 404) {
        Alert.alert("Nenhum Resultado", "Nenhum item de inventário foi encontrado para esta Ordem de Serviço.");
      } else {
        Alert.alert("Erro", "Não foi possível realizar a consulta. Tente novamente.");
      }
    }
  }, [selecoes, router, osMap]); // Adicionado osMap às dependências

  // ========================================
  // LOADING STATE (Sem alterações)
  // ========================================
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Carregando dados...</Text>
      </View>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  const modalData = getModalData();
  const isButtonDisabled = !selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os;

  return (
    <>
      {/* O MODAL ÚNICO QUE SERÁ REUTILIZADO */}
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
          <Text style={styles.title}>Consultar Inventário</Text>

          {/* CLIENTES */}
          <PickerDisplay
            label="1. Cliente"
            value={clienteMap.get(selecoes.cliente)} // Mostra a Razão Social
            placeholder="Selecione o Cliente"
            onPress={() => openModal('cliente')}
          />

          {/* PEDIDOS */}
          <PickerDisplay
            label="2. Pedido"
            value={selecoes.pedido}
            placeholder="Selecione o Pedido"
            onPress={() => openModal('pedido')}
            disabled={!selecoes.cliente || listaPedidos.length === 0}
          />

          {/* UNIDADES */}
          <PickerDisplay
            label="3. Unidade"
            value={selecoes.unidade}
            placeholder="Selecione a Unidade"
            onPress={() => openModal('unidade')}
            disabled={!selecoes.pedido || listaUnidades.length === 0}
          />

          {/* ORDENS DE SERVIÇO */}
          <PickerDisplay
            label="4. Ordem de Serviço"
            value={osMap.get(selecoes.os)} // Mostra o Número da OS
            placeholder="Selecione a OS"
            onPress={() => openModal('os')}
            disabled={!selecoes.unidade || listaOrdensServico.length === 0}
          />

          {/* BOTÃO CONSULTAR */}
          <TouchableOpacity
            style={[
              styles.button,
              isButtonDisabled && styles.buttonDisabled
            ]}
            onPress={handleConsultar}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>Consultar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

// ========================================
// STYLESHEET
// (Estilos completos para o formulário e o novo modal)
// ========================================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  
  // --- ESTILOS DO NOVO PICKERDISPLAY ---
  pickerDisplayContainer: { // Renomeado de pickerContainer para evitar conflito
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
    flex: 1, // Garante que o texto não empurre a seta
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 16,
    color: '#777',
    marginLeft: 10, // Espaçamento entre texto e seta
  },

  // --- ESTILOS DO MODAL ---
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
  
  // --- BOTÃO CONSULTAR (Seu estilo original) ---
  button: {
    backgroundColor: '#007AFF', // Cor azul padrão
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#99C9FF', // Cor azul clara para desabilitado
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});