<<<<<<< HEAD
// hooks/useSelecaoOS.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';


const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export function useSelecaoOS() {
  const [loading, setLoading] = useState(true);
  const [listaPedidosUnidades, setListaPedidosUnidades] = useState([]);
  const [listaOSProdutos, setListaOSProdutos] = useState([]);

  const [selecoes, setSelecoes] = useState({
    cliente: "",
    pedido: "",
    unidade: "",
    os: "",
  });

  // Carregar dados iniciais
=======
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

// ⚠️ IMPORTANTE: Ajuste os caminhos abaixo para onde estão seus componentes reais
import PickerDisplay from '../../components/PickerDisplay'; 
import SelectorModal from '../../components/SelectorModal'; 

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function RelatórioPedidos() {
  const router = useRouter();

  // =================================================================
  // 1. ESTADOS E LÓGICA DE DADOS (Antigo Hook)
  // =================================================================
  const [loading, setLoading] = useState(true);
  const [listaDadosBrutos, setListaDadosBrutos] = useState([]); 
  const [navegando, setNavegando] = useState(false);

  // Estado das seleções
  const [selecoes, setSelecoes] = useState({
    cliente: "",
    pedido: "",
  });

  // Estado visual do Modal
  const [modalType, setModalType] = useState(null);

  // --- BUSCA DE DADOS ---
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
<<<<<<< HEAD
        const [resPedidos, resOS] = await Promise.all([
          axios.get(`${API_BASE_URL}/visualizarpedido`),
          axios.get(`${API_BASE_URL}/visualizarosproduto`),
        ]);
        setListaPedidosUnidades(Array.isArray(resPedidos.data) ? resPedidos.data : []);
        setListaOSProdutos(Array.isArray(resOS.data) ? resOS.data : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
        Alert.alert("Erro de Conexão", "Não foi possível carregar os dados.");
=======
        // Busca apenas a rota que tem Cliente + Pedido
        const response = await axios.get(`${API_BASE_URL}/visualizarpedido`);
        setListaDadosBrutos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
        Alert.alert("Erro", "Não foi possível carregar a lista de pedidos.");
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

<<<<<<< HEAD
  // Normalização
=======
  // --- FILTROS (useMemo) ---
  
  // Normaliza texto (remove espaços, converte para string)
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
  const normalizar = useCallback((valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor).trim();
  }, []);

<<<<<<< HEAD
  // --- MEMOS (Listas Filtradas) ---

  const listaClientes = useMemo(() => {
    const map = new Map();
    listaPedidosUnidades.forEach(item => {
      if (!item) return;
=======
  // 1. Lista de Clientes (Únicos)
  const opcoesClientes = useMemo(() => {
    const map = new Map();
    listaDadosBrutos.forEach(item => {
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
      const cnpj = normalizar(item.cnpj_cliente);
      const razao = normalizar(item.razao_social);
      if (cnpj && razao) map.set(cnpj, razao);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
<<<<<<< HEAD
  }, [listaPedidosUnidades, normalizar]);

  const listaPedidos = useMemo(() => {
    if (!selecoes.cliente) return [];
    const pedidosSet = new Set();
    listaPedidosUnidades.forEach(item => {
=======
  }, [listaDadosBrutos, normalizar]);

  // 2. Lista de Pedidos (Filtrada pelo Cliente selecionado)
  const opcoesPedidos = useMemo(() => {
    if (!selecoes.cliente) return []; // Se não tem cliente, lista vazia
    
    const pedidosSet = new Set();
    listaDadosBrutos.forEach(item => {
      // Só adiciona se o CNPJ for igual ao selecionado
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
      if (normalizar(item.cnpj_cliente) === selecoes.cliente) {
        pedidosSet.add(normalizar(item.numeropedido));
      }
    });
    return Array.from(pedidosSet).sort().map(p => ({ value: p, label: p }));
<<<<<<< HEAD
  }, [selecoes.cliente, listaPedidosUnidades, normalizar]);

  const listaUnidades = useMemo(() => {
    if (!selecoes.pedido) return [];
    const unidadesSet = new Set();
    listaPedidosUnidades.forEach(item => {
      if (normalizar(item.numeropedido) === selecoes.pedido) {
        unidadesSet.add(normalizar(item.unidade_nome));
      }
    });
    return Array.from(unidadesSet).sort().map(u => ({ value: u, label: u }));
  }, [selecoes.pedido, listaPedidosUnidades, normalizar]);

  const listaOrdensServico = useMemo(() => {
    if (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade) return [];
    const osMap = new Map();
    listaOSProdutos.forEach(os => {
      if (
        normalizar(os.cnpj_cliente) === selecoes.cliente &&
        normalizar(os.unidade_cliente) === selecoes.unidade &&
        normalizar(os.numero_pedido_origem) === selecoes.pedido
      ) {
        const idOS = normalizar(os.id_os);
        const numeroOS = normalizar(os.numero_os) || `OS ${idOS}`;
        if (idOS) osMap.set(idOS, { value: idOS, label: numeroOS });
      }
    });
    return Array.from(osMap.values());
  }, [selecoes, listaOSProdutos, normalizar]);

  // Maps auxiliares para display (mostrar o nome ao invés do ID no botão)
  const clienteMap = useMemo(() => new Map(listaClientes.map(c => [c.value, c.label])), [listaClientes]);
  const osMap = useMemo(() => new Map(listaOrdensServico.map(os => [os.value, os.label])), [listaOrdensServico]);

  // Handler de seleção
  const handleSelect = (type, value) => {
    const valorNorm = normalizar(value);
    switch (type) {
      case 'cliente':
        setSelecoes({ cliente: valorNorm, pedido: "", unidade: "", os: "" });
        break;
      case 'pedido':
        setSelecoes(prev => ({ ...prev, pedido: valorNorm, unidade: "", os: "" }));
        break;
      case 'unidade':
        setSelecoes(prev => ({ ...prev, unidade: valorNorm, os: "" }));
        break;
      case 'os':
        setSelecoes(prev => ({ ...prev, os: valorNorm }));
        break;
    }
  };

  return {
    loading,
    selecoes,
    handleSelect,
    opcoes: {
      clientes: listaClientes,
      pedidos: listaPedidos,
      unidades: listaUnidades,
      os: listaOrdensServico
    },
    display: {
      clienteMap,
      osMap
    }
  };
}
=======
  }, [selecoes.cliente, listaDadosBrutos, normalizar]);

  // Mapa para exibir o NOME do cliente no botão (ao invés do CNPJ)
  const clienteMap = useMemo(() => {
    return new Map(opcoesClientes.map(c => [c.value, c.label]));
  }, [opcoesClientes]);

  // --- HANDLERS (Ações) ---

  const handleSelect = (tipo, valor) => {
    const valorNorm = normalizar(valor);
    
    if (tipo === 'cliente') {
      // Se trocou de cliente, reseta o pedido
      setSelecoes({ cliente: valorNorm, pedido: "" });
    } else if (tipo === 'pedido') {
      setSelecoes(prev => ({ ...prev, pedido: valorNorm }));
    }
    
    setModalType(null); // Fecha o modal após selecionar
  };

  const getLabel = (valor, map) => {
    if (!valor) return null;
    return map && map.has(valor) ? map.get(valor) : valor;
  };

  // Configuração do Modal dinâmico
  const getModalConfig = () => {
    switch (modalType) {
      case 'cliente':
        return { title: 'Selecione o Cliente', data: opcoesClientes };
      case 'pedido':
        return { title: 'Selecione o Pedido', data: opcoesPedidos };
      default:
        return { title: '', data: [] };
    }
  };
  const modalConfig = getModalConfig();

  // =================================================================
  // 2. AÇÃO FINAL (Botão OK)
  // =================================================================
  const handleOk = () => {
    if (navegando) return;
    const { cliente, pedido } = selecoes;

    if (!cliente || !pedido) {
      Alert.alert("Atenção", "Selecione Cliente e Pedido para continuar.");
      return;
    }

    setNavegando(true);

    // Navega enviando os dados
    router.push({
      pathname: "home", // ⚠️ Verifique se sua rota se chama 'home'
      params: {
        clienteId: String(cliente),
        pedidoNumero: String(pedido),
        nomeCliente: clienteMap.get(cliente) || String(cliente)
      }
    });
    
    // Opcional: setNavegando(false) se a tela não desmontar
  };

  // =================================================================
  // 3. RENDERIZAÇÃO (Visual)
  // =================================================================
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 1. SELETOR DE CLIENTE */}
      <PickerDisplay
        label="Cliente"
        placeholder="Selecione um cliente..."
        value={getLabel(selecoes.cliente, clienteMap)}
        onPress={() => setModalType('cliente')}
      />

      {/* 2. SELETOR DE PEDIDO (Desabilitado sem cliente) */}
      <PickerDisplay
        label="Pedido"
        placeholder="Selecione o pedido..."
        value={selecoes.pedido}
        disabled={!selecoes.cliente} // Bloqueia se não tiver cliente
        onPress={() => setModalType('pedido')}
      />

      {/* 3. BOTÃO DE CONFIRMAÇÃO */}
      <TouchableOpacity 
        style={[
          styles.button, 
          (!selecoes.cliente || !selecoes.pedido) && styles.buttonDisabled
        ]}
        onPress={handleOk}
        disabled={!selecoes.cliente || !selecoes.pedido}
      >
        <Text style={styles.buttonText}>
          {navegando ? "Carregando..." : "OK - Iniciar"}
        </Text>
      </TouchableOpacity>

      {/* MODAL REUTILIZÁVEL */}
      <SelectorModal
        visible={!!modalType}
        onClose={() => setModalType(null)}
        title={modalConfig.title}
        options={modalConfig.data}
        onSelect={(valor) => handleSelect(modalType, valor)}
        labelKey="label"
        valueKey="value"
      />

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
    gap: 16, // Espaçamento entre os campos
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#10B981', // Verde
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB', // Cinza
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
>>>>>>> 5adbd3a1b52175ee2031b018b98dc77a6571bfde
