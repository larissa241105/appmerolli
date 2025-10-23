import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app'; 

export default function EscolhaOSCadastro() {
  

  const [loading, setLoading] = useState(true);
  
  const [listaPedidosUnidades, setListaPedidosUnidades] = useState([]); 
  const [listaOSProdutos, setListaOSProdutos] = useState([]);         

  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState('');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');
  const [osSelecionada, setOsSelecionada] = useState('');

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
     
        const [resPedidos, resOS] = await Promise.all([
          axios.get(`${API_BASE_URL}/visualizarpedido`),
          axios.get(`${API_BASE_URL}/visualizarosproduto`)
        ]);
        setListaPedidosUnidades(resPedidos.data);
        setListaOSProdutos(resOS.data);
      } catch (error) {
        console.error("Erro ao buscar dados das APIs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Array vazio garante que rode apenas uma vez

  // 2. Lógica para popular os seletores em cascata

  // Nível 1: Clientes (usando a lista de pedidos como fonte principal)
  const listaClientes = useMemo(() => {
    const clientesMap = new Map();
    listaPedidosUnidades.forEach(item => {
      clientesMap.set(item.cnpj_cliente, item.razao_social);
    });
    return Array.from(clientesMap, ([cnpj, razao]) => ({ cnpj, razao_social: razao }));
  }, [listaPedidosUnidades]);

  // Nível 2: Pedidos (filtrados pelo cliente)
  const listaPedidos = useMemo(() => {
    if (!clienteSelecionado) return [];
    const pedidos = listaPedidosUnidades
      .filter(item => item.cnpj_cliente === clienteSelecionado)
      .map(item => item.numeropedido);
    return [...new Set(pedidos)];
  }, [clienteSelecionado, listaPedidosUnidades]);

  // Nível 3: Unidades (filtradas pelo pedido selecionado)
  const listaUnidades = useMemo(() => {
    if (!pedidoSelecionado) return [];
    const unidades = listaPedidosUnidades
      .filter(item => item.numeropedido === pedidoSelecionado)
      .map(item => item.unidade_nome);
    return [...new Set(unidades)];
  }, [pedidoSelecionado, listaPedidosUnidades]);

  // Nível 4: Ordens de Serviço (filtradas pelo CLIENTE e UNIDADE)
  const listaOrdensServico = useMemo(() => {
    if (!clienteSelecionado || !unidadeSelecionada) return [];
    return listaOSProdutos.filter(os => 
        os.cnpj_cliente === clienteSelecionado && os.unidade_cliente === unidadeSelecionada
    );
  }, [clienteSelecionado, unidadeSelecionada, listaOSProdutos]);

  // Handlers para resetar seleções em cascata
  const handleClienteChange = (cnpj) => {
    setClienteSelecionado(cnpj);
    setPedidoSelecionado('');
    setUnidadeSelecionada('');
    setOsSelecionada('');
  };

  const handlePedidoChange = (pedido) => {
    setPedidoSelecionado(pedido);
    setUnidadeSelecionada('');
    setOsSelecionada('');
  };
  
  const handleUnidadeChange = (unidade) => {
    setUnidadeSelecionada(unidade);
    setOsSelecionada('');
  };
  
  const handleSalvar = () => {
    if (!clienteSelecionado || !pedidoSelecionado || !unidadeSelecionada || !osSelecionada) {
        alert('Por favor, selecione todas as quatro opções.');
        return;
    }
    console.log({ clienteSelecionado, pedidoSelecionado, unidadeSelecionada, osSelecionada });
   router.push({
  // 👇 O PROBLEMA PROVAVELMENTE ESTÁ AQUI 👇
  pathname: 'home', 
  params: { 
    osId: osSelecionada,
    clienteCnpj: clienteSelecionado,
    unidadeNome: unidadeSelecionada,
  }
});
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Vincular Ordem de Serviço</Text>

          {/* --- 1. Seletor de Clientes --- */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={clienteSelecionado} onValueChange={handleClienteChange}>
              <Picker.Item label="1. Selecione o Cliente" value="" style={{ color: 'gray' }} />
              {listaClientes.map(c => <Picker.Item key={c.cnpj} label={c.razao_social} value={c.cnpj} />)}
            </Picker>
          </View>

          {/* --- 2. Seletor de Pedidos --- */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={pedidoSelecionado} onValueChange={handlePedidoChange} enabled={!!clienteSelecionado}>
              <Picker.Item label="2. Selecione o Pedido" value="" style={{ color: 'gray' }} />
              {listaPedidos.map(p => <Picker.Item key={p} label={p} value={p} />)}
            </Picker>
          </View>

          {/* --- 3. Seletor de Unidades --- */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={unidadeSelecionada} onValueChange={handleUnidadeChange} enabled={!!pedidoSelecionado}>
              <Picker.Item label="3. Selecione a Unidade" value="" style={{ color: 'gray' }} />
              {listaUnidades.map(u => <Picker.Item key={u} label={u} value={u} />)}
            </Picker>
          </View>
          
          {/* --- 4. Seletor de Ordem de Serviço (OS) --- */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={osSelecionada} onValueChange={setOsSelecionada} enabled={!!unidadeSelecionada}>
              <Picker.Item label="4. Selecione a Ordem de Serviço" value="" style={{ color: 'gray' }} />
              {listaOrdensServico.map(os => <Picker.Item key={os.id_os} label={os.numero_os} value={os.id_os} />)}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSalvar}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}


// --- Estilos para os componentes ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', 
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
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center'
  },
  title: {
    fontSize: 36,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'serif',
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
    backgroundColor: '#09137fff',
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