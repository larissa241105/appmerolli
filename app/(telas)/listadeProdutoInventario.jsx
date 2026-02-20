import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, } from 'react';
import { StyleSheet  } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
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

const { osId, nomeCliente, pedidoNumero, cnpj } = useLocalSearchParams();
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


  const baixarExcel = async () => {

    if (!pedidoNumero || !cnpj) {
      Alert.alert("Atenção", "Faltam dados (Pedido ou CNPJ) para gerar o relatório completo.");
      return;
    }

    try {
      console.log("Buscando relatório no banco...");

      const apiUrl = `${API_BASE_URL}/relatorio/${encodeURIComponent(pedidoNumero)}?cnpj=${encodeURIComponent(cnpj)}`;
      const response = await axios.get(apiUrl);
      const dadosDoBanco = response.data;

      if (!dadosDoBanco || dadosDoBanco.length === 0) {
        Alert.alert("Atenção", "Nenhum item encontrado no banco para este pedido e CNPJ.");
        return;
      }

      const paraMaiusculo = (valor) => valor ? String(valor).toUpperCase() : '-';

      const dadosFormatados = dadosDoBanco.map((item) => ({
        "Data": paraMaiusculo(item.data_criacao),
          "N° pedido": paraMaiusculo(item.numero_pedido),  
          "Nome Auxiliar": paraMaiusculo(item.nome_auxiliar),
          "Nome Cliente": paraMaiusculo(item.nome_cliente),
          "Tag Cliente": paraMaiusculo(item.tag_cliente),
          "Tag Antiga": paraMaiusculo(item.tag_antiga),
          "Setor": paraMaiusculo(item.setor),
          "Nome Colaborador": paraMaiusculo(item.nome_colaborador),
          "Família": paraMaiusculo(item.familia),
          "Tipo": paraMaiusculo(item.tipo),
          "Descrição": paraMaiusculo(item.descricao),
          "Marca": paraMaiusculo(item.marca),
          "Modelo": paraMaiusculo(item.modelo),
          "N° de série": paraMaiusculo(item.numero_serie),
          "Imei 1": paraMaiusculo(item.imei1),
          "Imei 2": paraMaiusculo(item.imei2),
          "Status": paraMaiusculo(item.status_produto)
      }));
  
      // 4. Cria a planilha
      const ws = XLSX.utils.json_to_sheet(dadosFormatados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
  
      // 5. Download Mobile (Lógica para o celular)
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `Relatorio_Pedido_${pedidoNumero}.xlsx`;
      const uri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: 'base64'
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Salvar Relatório Excel'
      });

    } catch (error) {
      console.error("Erro ao gerar Excel pela API:", error);
      Alert.alert("Erro", "Não foi possível buscar os dados do relatório no servidor.");
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
          onPress: baixarExcel, // Chama a função do Excel
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
    <TouchableOpacity onPress={abrirMenuOpcoes} style={styles.menuBtn}>
        <MaterialIcons name="more-vert" size={28} color="#ffffffff" />
    </TouchableOpacity>
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
    menuBtn: {
    padding: 5,
    marginLeft: 60,
   
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