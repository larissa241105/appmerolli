import React from 'react';
import { 
  Modal, View, Text, TextInput, FlatList, TouchableOpacity, Button, StyleSheet, SafeAreaView 
} from 'react-native';

const SearchableModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  search,
  setSearch
}) => {
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
            placeholder="Pesquisar..."
            placeholderTextColor="#757575"
            value={search}
            onChangeText={setSearch} // O Modal apenas repassa o texto
            autoCapitalize="none"
          />

          <FlatList
            data={options}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          
          <Button title="Fechar" onPress={onClose} color="#9c2a2a" />
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