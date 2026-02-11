

  import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelecaoOS } from '../src/hooks/useSelecaoOS';
import FormularioSelecaoOS from '../src/components/FormularioSelecaoOS';
import {Stack} from 'expo-router';

export default function EscolhaOSCadastro() {
  const router = useRouter();
  const controller = useSelecaoOS(); // Hook que gerencia a lógica
  const [navegando, setNavegando] = useState(false); // Evita duplo clique

  // ✅ A LÓGICA DO HANDLE CADASTRAR ADAPTADA
  const handleCadastrar = () => {
    try {
      // 1. Bloqueia múltiplos cliques
      if (navegando) return;

      // 2. Desestrutura os dados DO CONTROLLER
      const { cliente, pedido, unidade, os } = controller.selecoes;

      // 3. Validação de Campos Vazios
      if (!cliente || !pedido || !unidade || !os) {
        Alert.alert("Atenção", "Por favor, selecione todas as opções para iniciar o cadastro.");
        return;
      }

      // 4. Validação de Segurança (Verifica se a OS existe na lista válida carregada)
      // Nota: Acessamos via controller.display.osMap
      
      const osValida = controller.display.osMap.has(os);
      if (!osValida) {
        console.error("❌ OS não encontrada no Map:", os);
        Alert.alert("Erro", "A OS selecionada não é válida. Recarregue a página e tente novamente.");
        return;
      }

      // 5. Inicia Navegação
      setNavegando(true);

      // Prepara os parâmetros (convertendo para String por segurança)
      const params = {
        osId: String(os),
        clienteId: String(cliente), // Geralmente o CNPJ
        unidadeNome: String(unidade),
        pedidoNumero: String(pedido),
        // Opcional: Enviar o NOME do cliente para exibir na próxima tela
        nomeCliente: controller.display.clienteMap.get(cliente) || String(cliente)
      };

      console.log("📤 Iniciando cadastro com params:", params);

      // 6. Navega para a tela 'home' (ou a tela onde começa o inventário)
      router.push({
        pathname: "home", // ⚠️ Verifique se o nome da rota no seu Expo Router é 'home' mesmo
        params: params
      });

    } catch (error) {
      console.error("❌ Erro ao Navegar:", error);
      Alert.alert("Erro", `Ocorreu um erro ao tentar iniciar: ${error.message}`);
      setNavegando(false); // Libera o botão novamente em caso de erro
    }
  };

  // Loading da Tela (Enquanto busca dados na API)
  if (controller.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Carregando ordens de serviço...</Text>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Inventario</Text>
      </View>
    
      <FormularioSelecaoOS controller={controller} />
      

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            (!controller.selecoes.os || navegando) && styles.buttonDisabled
          ]}
          onPress={handleCadastrar}
          disabled={!controller.selecoes.os || navegando}
        >
          {navegando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>INICIAR CADASTRO</Text>
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
    marginTop: 50, // Empurra o botão para o final da tela (opcional) ou use margem fixa

    width: '100%',
  },
  button: {
    backgroundColor: '#125826', // Verde
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
    backgroundColor: '#D1D5DB', // Cinza
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});