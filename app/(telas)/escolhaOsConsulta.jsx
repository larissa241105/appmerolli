import { useState, useEffect, useMemo,useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function EscolhaOSConsulta() {
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

  // EFEITO PARA BUSCAR DADOS INICIAIS
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resPedidos, resOS] = await Promise.all([
          axios.get(`${API_BASE_URL}/visualizarpedido`),
          axios.get(`${API_BASE_URL}/visualizarosproduto`),
        ]);

        console.log("Total de Pedidos recebidos:", resPedidos?.data?.length || 0);
        console.log("Total de OS recebidas:", resOS?.data?.length || 0);

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

  // ✅ Função auxiliar para normalizar strings
  const normalizar = useCallback((valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor).trim();
  }, []);

  // ✅ Clientes únicos e válidos
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
      return Array.from(map, ([cnpj, razao_social]) => ({ cnpj, razao_social }));
    } catch (error) {
      console.error("Erro ao processar clientes:", error);
      return [];
    }
  }, [listaPedidosUnidades, normalizar]);

  // ✅ Lista de pedidos do cliente
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
      
      return Array.from(pedidosSet).sort();
    } catch (error) {
      console.error("Erro ao processar pedidos:", error);
      return [];
    }
  }, [selecoes.cliente, listaPedidosUnidades, normalizar]);

  // ✅ Lista de Unidades do Pedido
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
      
      return Array.from(unidadesSet).sort();
    } catch (error) {
      console.error("Erro ao processar unidades:", error);
      return [];
    }
  }, [selecoes.pedido, listaPedidosUnidades, normalizar]);

  // ✅ Lista de Ordens de Serviço
  const listaOrdensServico = useMemo(() => {
    try {
      if (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade) return [];

      console.log("🔍 Filtrando OS com:", {
        cliente: selecoes.cliente,
        pedido: selecoes.pedido,
        unidade: selecoes.unidade
      });

      const osMap = new Map();
      
      listaOSProdutos.forEach(os => {
        try {
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
              osMap.set(idOS, { id_os: idOS, numero: numeroOS });
            }
          }
        } catch (itemError) {
          console.error("Erro ao processar item OS:", itemError);
        }
      });

      const resultado = Array.from(osMap.values());
      console.log(`✅ ${resultado.length} OS encontradas`);
      
      return resultado;
    } catch (error) {
      console.error("Erro ao processar OS:", error);
      return [];
    }
  }, [selecoes.cliente, selecoes.pedido, selecoes.unidade, listaOSProdutos, normalizar]);

  // ✅ Handler para mudança de cliente
  const handleClienteChange = useCallback((value) => {
    try {
      const valorNorm = normalizar(value);
      if (valorNorm !== selecoes.cliente) {
        console.log("Selecionando cliente:", valorNorm);
        setSelecoes({ cliente: valorNorm, pedido: "", unidade: "", os: "" });
      }
    } catch (error) {
      console.error("Erro ao selecionar cliente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar o cliente.");
    }
  }, [selecoes.cliente, normalizar]);

  // ✅ Handler para mudança de pedido
  const handlePedidoChange = useCallback((value) => {
    try {
      const valorNorm = normalizar(value);
      if (valorNorm !== selecoes.pedido) {
        console.log("Selecionando pedido:", valorNorm);
        setSelecoes(prev => ({ ...prev, pedido: valorNorm, unidade: "", os: "" }));
      }
    } catch (error) {
      console.error("Erro ao selecionar pedido:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar o pedido.");
    }
  }, [selecoes.pedido, normalizar]);

  // ✅ Handler para mudança de unidade
  const handleUnidadeChange = useCallback((value) => {
    try {
      const valorNorm = normalizar(value);
      if (valorNorm !== selecoes.unidade) {
        console.log("Selecionando unidade:", valorNorm);
        setSelecoes(prev => ({ ...prev, unidade: valorNorm, os: "" }));
      }
    } catch (error) {
      console.error("Erro ao selecionar unidade:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar a unidade.");
    }
  }, [selecoes.unidade, normalizar]);

  // ✅ Handler de mudança de OS
  const handleOSChange = useCallback((value) => {
    try {
      const valorNorm = normalizar(value);
      
      if (!valorNorm) {
        console.log("⚠️ Valor vazio, ignorando");
        return;
      }
      
      // Verifica se a OS existe na lista
      const osExiste = listaOrdensServico.some(os => os.id_os === valorNorm);
      
      if (!osExiste) {
        console.error("❌ OS não encontrada na lista:", valorNorm);
        return;
      }
      
      console.log("✅ Selecionando OS:", valorNorm);
      setSelecoes(prev => ({ ...prev, os: valorNorm }));
      
    } catch (error) {
      console.error("❌ ERRO ao selecionar OS:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar a OS. Tente novamente.");
    }
  }, [listaOrdensServico, normalizar]);

  // ✅ Handler de consulta melhorado
  const handleConsultar = useCallback(async () => {
    try {
      const { cliente, pedido, unidade, os } = selecoes;
      
      console.log("🔍 Iniciando consulta com:", { cliente, pedido, unidade, os });
      
      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções para consultar.");
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
  }, [selecoes, router]);

  // ✅ Loading screen
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Consultar Inventário</Text>

        {/* CLIENTES */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selecoes.cliente}
            onValueChange={handleClienteChange}
          >
            <Picker.Item label="1. Selecione o Cliente" value="" />
            {listaClientes.map(c => (
              <Picker.Item
                key={`cliente-${c.cnpj}`}
                label={c.razao_social}
                value={c.cnpj}
              />
            ))}
          </Picker>
        </View>

        {/* PEDIDOS */}
        <View style={styles.pickerContainer}>
          <Picker
            enabled={!!selecoes.cliente && listaPedidos.length > 0}
            selectedValue={selecoes.pedido}
            onValueChange={handlePedidoChange}
          >
            <Picker.Item label="2. Selecione o Pedido" value="" />
            {listaPedidos.map(p => (
              <Picker.Item key={`pedido-${p}`} label={p} value={p} />
            ))}
          </Picker>
        </View>

        {/* UNIDADES */}
        <View style={styles.pickerContainer}>
          <Picker
            enabled={!!selecoes.pedido && listaUnidades.length > 0}
            selectedValue={selecoes.unidade}
            onValueChange={handleUnidadeChange}
          >
            <Picker.Item label="3. Selecione a Unidade" value="" />
            {listaUnidades.map(u => (
              <Picker.Item key={`unidade-${u}`} label={u} value={u} />
            ))}
          </Picker>
        </View>

        {/* ORDENS DE SERVIÇO */}
        <View style={styles.pickerContainer}>
          <Picker
            enabled={!!selecoes.unidade && listaOrdensServico.length > 0}
            selectedValue={selecoes.os}
            onValueChange={handleOSChange}
          >
            <Picker.Item label="4. Selecione a OS" value="" />
            {listaOrdensServico.map(os => (
              <Picker.Item
                key={`os-${os.id_os}`}
                label={os.numero}
                value={os.id_os}
              />
            ))}
          </Picker>
        </View>

        {/* BOTÃO CONSULTAR */}
        <TouchableOpacity 
          style={[
            styles.button,
            (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os) && styles.buttonDisabled
          ]} 
          onPress={handleConsultar}
          disabled={!selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os}
        >
          <Text style={styles.buttonText}>Consultar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', // Fundo preto para a tela inteira
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fundo branco para a área do formulário
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center'
  },
  title: {
    fontSize: 36,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'serif', // Fonte serifada para um estilo mais clássico
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 25,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#0b4f05ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});