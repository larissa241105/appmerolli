import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { router } from 'expo-router';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function ListadeProdutoInventario() {

const { osId, nomeCliente, pedidoNumero } = useLocalSearchParams();
  const router = useRouter(); 
   const insets = useSafeAreaInsets();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const itensRef = useRef([]);

  useEffect(() => {
    itensRef.current = itens;
  }, [itens]);

  useFocusEffect(
    useCallback(() => {
      async function fetchInventario() {
        const apiUrl = `${API_BASE_URL}/api/inventario/consulta?osId=${osId}`;
        console.log("Buscando dados em:", apiUrl);

        try {
          setLoading(true);
          const response = await axios.get(apiUrl);
          const dadosRecebidos = Array.isArray(response.data) ? response.data : [];
          
          setItens(dadosRecebidos);
          itensRef.current = dadosRecebidos; // Atualiza a referência imediatamente

        } catch (error) {
          if (error.response && error.response.status === 404) {
            setItens([]);
          } else {
            console.error("Erro ao buscar dados:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados.");
          }
        } finally {
          setLoading(false);
        }
      }

      if (osId) {
        fetchInventario();
      } else {
        Alert.alert("Erro", "ID da OS não encontrado.");
        setLoading(false);
      }

      return () => {};
    }, [osId])
  );


  const gerarExcel = async () => {
    // --- CORREÇÃO 2: Lê do 'cofre' (ref) em vez do estado direto ---
    const dadosAtuais = itensRef.current;

    console.log("Tentando gerar excel com qtd itens:", dadosAtuais.length);

    if (!dadosAtuais || dadosAtuais.length === 0) {
      Alert.alert("Atenção", "Não há itens carregados para gerar o Excel.");
      return;
    }

    try {
      // 1. Cria a planilha
      const ws = XLSX.utils.json_to_sheet(dadosAtuais);

      // 2. Cria o livro
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");

      // 3. Gera o arquivo em base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // 4. Define o caminho
      const fileName = `Inventario_${nomeCliente || 'Cliente'}_${osId}.xlsx`;
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uri = FileSystem.documentDirectory + cleanFileName;

      // 5. Escreve o arquivo
      // --- IMPORTANTE: Usamos string 'base64' direto para evitar erro de versão ---
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: 'base64' 
      });

      // 6. Compartilha
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Baixar Excel do Inventário'
      });

    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      Alert.alert("Erro", `Falha ao gerar o arquivo: ${error.message}`);
    }
  };

  // --- LÓGICA DO MENU (3 PONTINHOS) ---
  const abrirMenuOpcoes = () => {
    Alert.alert(
      "Opções",
      "O que deseja fazer?",
      [
        
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Gerar Excel Completo",
          onPress: gerarExcel, // Chama a função do Excel
        },
      ]
    );
  };


  const handleItemPress = (item) => {

    router.push({
      pathname: 'editarProdutoInventario', 
      params: { item: JSON.stringify(item) }
    });
  };

  const renderItemCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card} 
      onPress={() => handleItemPress(item)}
    >
      <Text style={styles.cardTitle}>Tag: {item.tag_cliente}</Text>
      <Text style={styles.cardText}>Nome: {item.tipo}</Text>
      <Text style={styles.cardStatus}>Descrição: {item.descricao}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.loadingText}>Carregando inventário...</Text>
      </View>
    );
  }

  if (itens.length === 0) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.emptyText}>Nenhum item encontrado para esta OS.</Text>
      </View>
    );
  }

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Itens do inventário</Text>
            </View>
    <View style={styles.container}>
       
      <Text style={styles.title}>{nomeCliente}</Text>
      <Text style={styles.title2}>
       Quantidade de itens: {itens.length}
      </Text>
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id || item.nossa_tag)}
        renderItem={renderItemCard} 
        contentContainerStyle={{ paddingBottom: 20 }} 
      />
    </View>
    </>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', 
    paddingHorizontal: 10,
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
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181818ff',
    marginVertical: 15,
    paddingHorizontal: 5,
  },
   title2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
    paddingHorizontal: 2,
  },

  card: {
    backgroundColor: '#ffffff', 
    borderRadius: 8,         
    padding: 16,            
    marginVertical: 8,       
    marginHorizontal: 5,    

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 5,
  }
});