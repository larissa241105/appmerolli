// components/SeletorOS.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

// Você pode passar estilos customizados via props se quiser
export default function SeletorOS({ controller }) {
  const { selecoes, handleSelect, opcoes, display } = controller;

  const [modalState, setModalState] = useState({ visible: false, type: null });

  const openModal = (type) => setModalState({ visible: true, type });
  const closeModal = () => setModalState({ visible: false, type: null });

  const onSelectItem = (value) => {
    handleSelect(modalState.type, value);
    closeModal();
  };

  // Configuração dinâmica do modal baseada no tipo aberto
  const getModalConfig = () => {
    switch (modalState.type) {
      case 'cliente': return { title: 'Selecione o Cliente', data: opcoes.clientes };
      case 'pedido': return { title: 'Selecione o Pedido', data: opcoes.pedidos };
      case 'unidade': return { title: 'Selecione a Unidade', data: opcoes.unidades };
      case 'os': return { title: 'Selecione a OS', data: opcoes.os };
      default: return { title: '', data: [] };
    }
  };

  const modalConfig = getModalConfig();

  // Helper para renderizar o texto do botão (Placeholder ou Valor Selecionado)
  const renderLabel = (label, value, map = null) => {
    if (!value) return label; // Ex: "Selecionar Cliente"
    if (map && map.has(value)) return map.get(value); // Ex: "Empresa X"
    return value;
  };

  return (
    <View style={styles.container}>
      {/* Botão Cliente */}
      <BotaoSeletor 
        label={renderLabel("Selecione o Cliente", selecoes.cliente, display.clienteMap)}
        onPress={() => openModal('cliente')}
        active={!!selecoes.cliente}
      />

      {/* Botão Pedido (só habilita se tiver cliente) */}
      <BotaoSeletor 
        label={renderLabel("Selecione o Pedido", selecoes.pedido)}
        onPress={() => openModal('pedido')}
        disabled={!selecoes.cliente}
        active={!!selecoes.pedido}
      />

      {/* Botão Unidade */}
      <BotaoSeletor 
        label={renderLabel("Selecione a Unidade", selecoes.unidade)}
        onPress={() => openModal('unidade')}
        disabled={!selecoes.pedido}
        active={!!selecoes.unidade}
      />

      {/* Botão OS */}
      <BotaoSeletor 
        label={renderLabel("Selecione a OS", selecoes.os, display.osMap)}
        onPress={() => openModal('os')}
        disabled={!selecoes.unidade}
        active={!!selecoes.os}
      />

      {/* --- MODAL REUTILIZÁVEL --- */}
      <Modal visible={modalState.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.data}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => onSelectItem(item.value)}>
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Componente simples para o botão (para não repetir código visual)
function BotaoSeletor({ label, onPress, disabled, active }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.selectorButton, 
        disabled && styles.disabledButton,
        active && styles.activeButton
      ]}
    >
      <Text style={[styles.selectorText, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 20 },
  selectorButton: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  disabledButton: { backgroundColor: '#f0f0f0', opacity: 0.6 },
  activeButton: { borderColor: '#007AFF', backgroundColor: '#F5F9FF' },
  selectorText: { color: '#333' },
  activeText: { color: '#007AFF', fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16 },
  closeButton: { marginTop: 15, padding: 10, alignItems: 'center', backgroundColor: '#ddd', borderRadius: 5 },
  closeText: { fontWeight: 'bold' }
});