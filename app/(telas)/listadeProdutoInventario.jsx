import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function ListadeProdutoInventario() {

  const { osId } = useLocalSearchParams();
  const router = useRouter(); 

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (osId) {
      async function fetchInventario() {
        const apiUrl = `${API_BASE_URL}/api/inventario/consulta?osId=${osId}`;
        console.log("Buscando dados em:", apiUrl);

        try {
          setLoading(true);
          const response = await axios.get(apiUrl);
          setItens(Array.isArray(response.data) ? response.data : []);

        } catch (error) {
          if (error.response && error.response.status === 404) {

            console.log("Nenhum item encontrado.");
          } else {
            console.error("Erro ao buscar dados do inventário:", error);
            Alert.alert("Erro de Conexão", "Não foi possível carregar os dados.");
          }
        } finally {
          setLoading(false);
        }
      }

      fetchInventario();
    } else {
      Alert.alert("Erro", "ID da Ordem de Serviço não encontrado.");
      setLoading(false);
    }
  }, [osId]);


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
      <Text style={styles.cardTitle}>Tag: {item.nossa_tag}</Text>
      <Text style={styles.cardText}>Descrição: {item.descricao}</Text>
      <Text style={styles.cardStatus}>Status: {item.status_produto}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#007BFF" />
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
    <View style={styles.container}>
      <Text style={styles.title}>Itens do Inventário (OS: {osId})</Text>
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id || item.nossa_tag)}
        renderItem={renderItemCard} 
        contentContainerStyle={{ paddingBottom: 20 }} 
      />
    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', 
    paddingHorizontal: 10,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 15,
    paddingHorizontal: 5,
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