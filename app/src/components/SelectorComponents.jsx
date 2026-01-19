import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable, StyleSheet } from 'react-native';

// --- SELETOR MODAL ---
export const SelectorModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  labelKey = 'label',
  valueKey = 'value',
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Trocamos SafeAreaView por View para evitar conflitos de arquitetura */}
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {(!options || options.length === 0) ? (
          <View style={styles.modalEmptyContainer}>
            <Text style={styles.modalEmptyText}>Nenhuma opção disponível.</Text>
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => String(item[valueKey])}
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item[valueKey]);
                  onClose();
                }}
              >
                {/* Garante que o item renderizado seja sempre string */}
                <Text style={styles.modalItemText}>
                  {String(item[labelKey] || '')}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

// --- PICKER DISPLAY ---
export const PickerDisplay = ({ label, value, onPress, disabled, placeholder }) => {
  // Garante que displayValue seja sempre uma String segura
  const displayValue = (value !== null && value !== undefined && value !== "") 
    ? String(value) 
    : placeholder;

  // Decide o estilo
  const isPlaceholder = !value || value === "";
  const textStyle = isPlaceholder ? styles.pickerPlaceholderText : styles.pickerDisplayText;

  return (
    <View style={styles.pickerDisplayContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={textStyle} numberOfLines={1}>
          {displayValue}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Picker Styles
  pickerDisplayContainer: { marginBottom: 16 },
  pickerLabel: { fontSize: 14, color: '#666', marginBottom: 4, fontWeight: '600' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, height: 50 },
  pickerButtonDisabled: { backgroundColor: '#f5f5f5', borderColor: '#eee' },
  pickerDisplayText: { fontSize: 16, color: '#333' },
  pickerPlaceholderText: { fontSize: 16, color: '#999' },
  pickerArrow: { fontSize: 12, color: '#666' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 40 }, // Added paddingTop for status bar
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalCloseButton: { padding: 8 },
  modalCloseText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  modalEmptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalEmptyText: { fontSize: 16, color: '#999' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 16, color: '#333' },
});