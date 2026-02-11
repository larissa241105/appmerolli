import React from 'react';
import { 
  Modal, View, Text, TextInput, FlatList, TouchableOpacity, Button, StyleSheet, SafeAreaView 
} from 'react-native';

const SearchableModal = ({
  visible,
  onClose,
  options = [],
  onSelect,
  title,
  search,
  setSearch
}) => {

  // 1. Normaliza o texto para Maiúsculas para comparação e cadastro
  const textoBusca = search ? search.toUpperCase() : "";

  // 2. Verifica se o que foi digitado JÁ EXISTE na lista (para não duplicar)
  const existeNaLista = options.some(item => 
    String(item).toUpperCase() === textoBusca.trim()
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar ou Digitar Novo..."
            placeholderTextColor="#757575"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="characters" // Força o teclado em maiúsculo
          />

          <FlatList
            data={options}
            keyExtractor={(item, index) => `${item}-${index}`}
            keyboardShouldPersistTaps="handled" // Importante para o clique funcionar com teclado aberto
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            
            // --- A MÁGICA ACONTECE AQUI ---
            ListFooterComponent={() => {
              // Se tem texto digitado E ele NÃO é igual a nenhum item da lista
              if (textoBusca.trim().length > 0 && !existeNaLista) {
                return (
                  <TouchableOpacity 
                    style={[styles.modalItem, { borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#f0f8ff' }]} 
                    onPress={() => {
                      onSelect(textoBusca.trim()); // Envia o texto digitado
                      // O onClose será chamado pelo pai ou você pode chamar aqui se preferir
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: '#007bff', fontWeight: 'bold' }]}>
                      Cadastrar: "{textoBusca}"
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
            // Mostra mensagem se a lista estiver vazia e não tiver busca
            ListEmptyComponent={() => (
               !search && <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>Nenhuma opção disponível.</Text>
            )}
          />
          
          <View style={{ marginTop: 10 }}>
            <Button title="Fechar" onPress={onClose} color="#9c2a2a" />
          </View>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 12,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%', // Importante para não estourar a tela
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#969595',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    color: '#333'
  },
  modalItem: {
    padding: 20,
  },
  modalItemText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  }
});

export default SearchableModal;