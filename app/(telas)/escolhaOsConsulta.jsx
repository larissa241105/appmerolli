import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useSelecaoOS } from '../src/hooks/useSelecaoOS'; 
import FormularioSelecaoOS from '../src/components/FormularioSelecaoOS'; 
import {Stack} from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function EscolhaOSConsulta() {
 const router = useRouter();
  const controller = useSelecaoOS(); 
  const [loadingConsulta, setLoadingConsulta] = useState(false);

  const handleConsultar = async () => {
    try {

      const { cliente, pedido, unidade, os } = controller.selecoes;

      console.log("🔍 Iniciando consulta com:", { cliente, pedido, unidade, os });
      
 
      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções para consultar.");
        return;
      }
      
      
      if (!controller.display.osMap.has(os)) {
        Alert.alert("Erro", "A OS selecionada não é mais válida. Por favor, selecione novamente.");
        return;
      }

      setLoadingConsulta(true);

      const nomeClienteParaEnvio = controller.display.clienteMap.get(cliente) || cliente;

      const apiUrl = `${API_BASE_URL}/api/inventario/consulta?osId=${encodeURIComponent(os)}`;
      console.log("📡 Chamando API:", apiUrl);
      

      await axios.get(apiUrl);
      
      console.log("✅ API respondeu, navegando...");


      router.push({
        pathname: 'listadeProdutoInventario',
        params: { 
            osId: os, 
            nomeCliente: nomeClienteParaEnvio, 
            pedidoNumero: pedido,
            cnpj: cliente
        }
      });

    } catch (error) {
      console.error("❌ Erro na consulta:", error);
      setLoadingConsulta(false); // Para o loading em caso de erro

      if (error?.response?.status === 404) {
        Alert.alert("Nenhum Resultado", "Nenhum item de inventário foi encontrado para esta Ordem de Serviço.");
      } else {
        Alert.alert("Erro", "Não foi possível realizar a consulta. Tente novamente.");
      }
    } finally {
        // Se a navegação acontecer rápido, o unmount limpa o state, 
        // mas se falhar, precisamos garantir que o loading pare.
        if (loadingConsulta) setLoadingConsulta(false); 
    }
  };

  // Loading inicial dos selects (carregando dados do servidor)
  if (controller.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando opções...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          {/* Mudei a cor para escuro (#333) pois o fundo da tela é claro */}
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultar Inventario</Text>
      </View>
     

      {/* Formulário Reutilizável */}
      <FormularioSelecaoOS controller={controller} />

      {/* Botão de Ação */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            (!controller.selecoes.os || loadingConsulta) && styles.buttonDisabled
          ]}
          onPress={handleConsultar}
          disabled={!controller.selecoes.os || loadingConsulta}
        >
          {loadingConsulta ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>CONSULTAR DADOS</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row', // Deixa um ao lado do outro
    alignItems: 'center', // Centraliza verticalmente
    marginBottom: 40,     // Espaço abaixo do header
  },
  backBtn: {
    marginRight: 15,      // Espaço entre a seta e o texto
    padding: 5,           // Aumenta a área de toque
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,              // Ocupa o resto do espaço se precisar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  footer: {
    marginTop: 40,
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#1f5691', // Azul para Consulta (diferente do Verde de Cadastro)
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});