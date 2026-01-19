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

  // Normalização
  const normalizar = useCallback((valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor).trim();
  }, []);

  // --- MEMOS (Listas Filtradas) ---

  const listaClientes = useMemo(() => {
    const map = new Map();
    listaPedidosUnidades.forEach(item => {
      if (!item) return;
      const cnpj = normalizar(item.cnpj_cliente);
      const razao = normalizar(item.razao_social);
      if (cnpj && razao) map.set(cnpj, razao);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [listaPedidosUnidades, normalizar]);

  const listaPedidos = useMemo(() => {
    if (!selecoes.cliente) return [];
    const pedidosSet = new Set();
    listaPedidosUnidades.forEach(item => {
      if (normalizar(item.cnpj_cliente) === selecoes.cliente) {
        pedidosSet.add(normalizar(item.numeropedido));
      }
    });
    return Array.from(pedidosSet).sort().map(p => ({ value: p, label: p }));
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