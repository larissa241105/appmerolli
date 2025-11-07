import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  StyleSheet 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

// ========================================
// FUNÇÃO DE NORMALIZAÇÃO (FORA DO COMPONENTE)
// ========================================
const normalizar = (valor) => {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function EscolhaOSCadastro() {
  console.log("--- COMPONENTE RENDERIZOU ---");
  const router = useRouter();
  const timeoutRef = useRef(null);

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

  // ========================================
  // BUSCAR DADOS DA API
  // ========================================
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

        // Validar estrutura dos dados
        if (resOS?.data && Array.isArray(resOS.data) && resOS.data.length > 0) {
          const primeiraOS = resOS.data[0];
          console.log("📋 Estrutura da primeira OS:", {
            id_os: primeiraOS?.id_os,
            numero_os: primeiraOS?.numero_os,
            cnpj_cliente: primeiraOS?.cnpj_cliente,
            unidade_cliente: primeiraOS?.unidade_cliente,
            numero_pedido_origem: primeiraOS?.numero_pedido_origem,
          });
        }

        setListaPedidosUnidades(Array.isArray(resPedidos.data) ? resPedidos.data : []);
        setListaOSProdutos(Array.isArray(resOS.data) ? resOS.data : []);
      } catch (error) {
        console.error("❌ Erro ao buscar dados:", error.message);
        console.error("Stack:", error.stack);
        Alert.alert("Erro de Conexão", "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ========================================
  // LIMPAR TIMEOUT NO UNMOUNT
  // ========================================
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ========================================
  // LISTA DE CLIENTES
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
      return Array.from(map, ([cnpj, razao_social]) => ({ cnpj, razao_social }));
    } catch (error) {
      console.error("Erro ao processar clientes:", error);
      return [];
    }
  }, [listaPedidosUnidades]);

  // ========================================
  // LISTA DE PEDIDOS
  // ========================================
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
  }, [selecoes.cliente, listaPedidosUnidades]);

  // ========================================
  // LISTA DE UNIDADES
  // ========================================
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
  }, [selecoes.pedido, listaPedidosUnidades]);

  // ========================================
  // LISTA DE ORDENS DE SERVIÇO
  // ========================================
  const listaOrdensServico = useMemo(() => {
    try {
      if (!selecoes.cliente || !selecoes.pedido || !selecoes.unidade) {
        console.log("⚠️ Seleções incompletas, retornando array vazio");
        return [];
      }

      console.log("🔍 Filtrando OS com:", {
        cliente: selecoes.cliente,
        pedido: selecoes.pedido,
        unidade: selecoes.unidade
      });

      if (!Array.isArray(listaOSProdutos) || listaOSProdutos.length === 0) {
        console.log("⚠️ listaOSProdutos vazio");
        return [];
      }

      const osMap = new Map();
      
      listaOSProdutos.forEach((os, index) => {
        try {
          if (!os || typeof os !== 'object') {
            return;
          }
          
          if (os.id_os == null || os.id_os === '') {
            return;
          }
          
          const cnpj = normalizar(os.cnpj_cliente);
          const unidade = normalizar(os.unidade_cliente);
          const pedido = normalizar(os.numero_pedido_origem);
          
          if (cnpj === selecoes.cliente && 
              unidade === selecoes.unidade && 
              pedido === selecoes.pedido) {
            
            const idOS = normalizar(os.id_os);
            const numeroOS = normalizar(os.numero_os) || `OS ${idOS}`;
            
            if (idOS) {
              osMap.set(idOS, { id_os: idOS, numero: numeroOS });
            }
          }
        } catch (itemError) {
          console.error(`❌ Erro no item ${index}:`, itemError);
        }
      });

      const resultado = Array.from(osMap.values());
      console.log(`✅ ${resultado.length} OS encontradas`);
      
      if (resultado.length === 0) {
        console.log("⚠️ NENHUMA OS ENCONTRADA! Verifique os critérios de filtragem.");
      }
      
      return resultado;
    } catch (error) {
      console.error("❌ ERRO ao processar OS:", error);
      return [];
    }
  }, [selecoes.cliente, selecoes.pedido, selecoes.unidade, listaOSProdutos]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleClienteChange = (value) => {
    try {
      const valorNorm = normalizar(value);
      console.log(`SELECIONADO CLIENTE: ${valorNorm}`);
      setSelecoes({ cliente: valorNorm, pedido: "", unidade: "", os: "" });
    } catch (error) {
      console.error("Erro ao selecionar cliente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar o cliente.");
    }
  };

  const handlePedidoChange = (value) => {
    try {
      const valorNorm = normalizar(value);
      console.log(`SELECIONADO PEDIDO: ${valorNorm}`);
      setSelecoes(prev => ({ ...prev, pedido: valorNorm, unidade: "", os: "" }));
    } catch (error) {
      console.error("Erro ao selecionar pedido:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar o pedido.");
    }
  };

  const handleUnidadeChange = (value) => {
    try {
      const valorNorm = normalizar(value);
      console.log(`SELECIONADO UNIDADE: ${valorNorm}`);
      setSelecoes(prev => ({ ...prev, unidade: valorNorm, os: "" }));
    } catch (error) {
      console.error("Erro ao selecionar unidade:", error);
      Alert.alert("Erro", "Ocorreu um erro ao selecionar a unidade.");
    }
  };

  const handleOSChange = (value) => {
    try {
      console.log("📥 handleOSChange chamado com:", value, "tipo:", typeof value);
      
      if (value == null || value === '') {
        console.log("⚠️ Valor vazio, ignorando");
        return;
      }
      
      const valorNorm = normalizar(value);
      
      if (!valorNorm) {
        console.log("⚠️ Valor vazio após normalização");
        return;
      }
      
      const osExiste = listaOrdensServico.some(os => os.id_os === valorNorm);
      
      if (!osExiste) {
        console.error("❌ OS não encontrada:", valorNorm);
        console.error("IDs disponíveis:", listaOrdensServico.map(os => os.id_os));
        Alert.alert("Erro", "Ordem de Serviço inválida.");
        return;
      }
      
      console.log(`✅ SELECIONADO OS: ${valorNorm}`);
      
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Usar debounce para evitar múltiplas atualizações
      timeoutRef.current = setTimeout(() => {
        setSelecoes(prev => {
          console.log("📝 Atualizando estado com OS:", valorNorm);
          return { ...prev, os: valorNorm };
        });
      }, 50);
      
    } catch (error) {
      console.error("❌ ERRO em handleOSChange:", error);
      console.error("Stack:", error.stack);
      Alert.alert("Erro Crítico", `Erro: ${error.message}`);
    }
  };

  const handleSalvar = () => {
    try {
      if (navegando) {
        console.log("⚠️ Já está navegando, ignorando");
        return;
      }

      const { cliente, pedido, unidade, os } = selecoes;
      
      console.log("🔍 Tentando salvar com:", { cliente, pedido, unidade, os });

      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções.");
        return;
      }

      // Validar se a OS ainda existe na lista
      const osValida = listaOrdensServico.find(item => item.id_os === os);
      
      if (!osValida) {
        console.error("❌ OS não encontrada na lista:", os);
        Alert.alert("Erro", "A OS selecionada não é mais válida. Tente novamente.");
        return;
      }

      console.log("✅ OS validada:", osValida);

      setNavegando(true);

      // Garantir que os params são strings
      const params = {
        osId: String(os),
        clienteCnpj: String(cliente),
        unidadeNome: String(unidade),
        pedidoNumero: String(pedido),
      };

      console.log("📤 Navegando com params:", params);

      // Usar setTimeout para evitar race conditions
      setTimeout(() => {
        try {
          router.push({
            pathname: "/home",
            params: params
          });
        } catch (navError) {
          console.error("❌ Erro na navegação:", navError);
          Alert.alert("Erro", "Não foi possível navegar. Tente novamente.");
          setNavegando(false);
        }
      }, 100);

    } catch (error) {
      console.error("❌ Erro ao Salvar/Navegar:", error);
      console.error("Stack:", error.stack);
      Alert.alert("Erro", `Ocorreu um erro ao navegar: ${error.message}`);
      setNavegando(false);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  // ========================================
  // LOG DE CONTADORES
  // ========================================
  console.log("📊 Contadores:", {
    clientes: listaClientes.length,
    pedidos: listaPedidos.length,
    unidades: listaUnidades.length,
    os: listaOrdensServico.length
  });

  // ========================================
  // RENDER
  // ========================================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Vincular Ordem de Serviço</Text>

        {/* CLIENTES */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selecoes.cliente}
            onValueChange={handleClienteChange}
            enabled={!navegando}
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
            enabled={!navegando && !!selecoes.cliente && listaPedidos.length > 0}
            selectedValue={selecoes.pedido}
            onValueChange={handlePedidoChange}
          >
            <Picker.Item label="2. Selecione o Pedido" value="" />
            {listaPedidos.map(p => (
              <Picker.Item 
                key={`pedido-${p}`} 
                label={p} 
                value={p} 
              />
            ))}
          </Picker>
        </View>

        {/* UNIDADES */}
        <View style={styles.pickerContainer}>
          <Picker
            enabled={!navegando && !!selecoes.pedido && listaUnidades.length > 0}
            selectedValue={selecoes.unidade}
            onValueChange={handleUnidadeChange}
          >
            <Picker.Item label="3. Selecione a Unidade" value="" />
            {listaUnidades.map(u => (
              <Picker.Item 
                key={`unidade-${u}`} 
                label={u} 
                value={u} 
              />
            ))}
          </Picker>
        </View>

        {/* ORDENS DE SERVIÇO */}
        <View style={styles.pickerContainer}>
          <Picker
            enabled={!navegando && !!selecoes.unidade && listaOrdensServico.length > 0}
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

        {/* DEBUG INFO (apenas em desenvolvimento) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>OS disponíveis: {listaOrdensServico.length}</Text>
            <Text style={styles.debugText}>OS selecionada: {selecoes.os || "nenhuma"}</Text>
            <Text style={styles.debugText}>Navegando: {navegando ? "Sim" : "Não"}</Text>
          </View>
        )}

        {/* BOTÃO SALVAR */}
        <TouchableOpacity 
          style={[
            styles.button,
            (navegando || !selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os) && styles.buttonDisabled
          ]} 
          onPress={handleSalvar}
          disabled={navegando || !selecoes.cliente || !selecoes.pedido || !selecoes.unidade || !selecoes.os}
        >
          <Text style={styles.buttonText}>
            {navegando ? "Carregando..." : "Salvar"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ========================================
// ESTILOS
// ========================================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    borderRadius: 5,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    marginVertical: 2,
  },
});