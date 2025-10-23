import { Stack, router } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function ClienteUnidadeScreen() {

  // Dados de exemplo com 3 itens
  const dadosDosClientes = [
    {
      id: 1,
      tagCliente: 'TAG_CLIENTE_001',
      nossaTag: 'NOSSA_TAG_A',
      nomeProduto: 'Produto A',
      familia: 'Família Principal',
      tipo: 'Tipo X',
    },
    {
      id: 2,
      tagCliente: 'TAG_CLIENTE_002',
      nossaTag: 'NOSSA_TAG_B',
      nomeProduto: 'Produto B',
      familia: 'Família Secundária',
      tipo: 'Tipo Y',
    },
    {
      id: 3,
      tagCliente: 'TAG_CLIENTE_003',
      nossaTag: 'NOSSA_TAG_C',
      nomeProduto: 'Produto C',
      familia: 'Família Principal',
      tipo: 'Tipo X',
    },
  ];

  // Função para navegar para a tela de detalhes
  const handleCardPress = (clienteId) => {
    router.push('editarProdutoInventario');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'MerolliSoft',
          headerStyle: { backgroundColor: '#000000ff' },
          headerTitleStyle: { fontWeight: 'bold', color: '#ffffffff' },
          headerTintColor: '#ffffffff',
        }}
      />
      
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Cliente - Unidade</Text>
        
        {dadosDosClientes.map((item) => (
          // O TouchableOpacity torna a View clicável
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            onPress={() => handleCardPress(item.id)} // Chama a função de navegação ao pressionar
          >
            <Text style={styles.cardText}>Tag Cliente: {item.tagCliente}</Text>
            <Text style={styles.cardText}>Nossa Tag: {item.nossaTag}</Text>
            <Text style={styles.cardText}>Nome produto: {item.nomeProduto}</Text>
            <Text style={styles.cardText}>Família: {item.familia}</Text>
            <Text style={styles.cardText}>Tipo: {item.tipo}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
});