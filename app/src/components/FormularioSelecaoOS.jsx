import React, { useState } from 'react';
import { View } from 'react-native';
import { SelectorModal, PickerDisplay } from './SelectorComponents';

export default function FormularioSelecaoOS({ controller }) {
  // Pega tudo o que o Hook retorna
  const { selecoes, handleSelect, opcoes, display } = controller;

  // Estado local apenas para controlar qual modal está aberto
  const [modalType, setModalType] = useState(null); // 'cliente', 'pedido', 'unidade', 'os'

  // Helper para fechar o modal
  const closeModal = () => setModalType(null);

  // Configuração dinâmica: O que mostrar no Modal baseado no tipo
  const getModalConfig = () => {
    switch (modalType) {
      case 'cliente':
        return { title: 'Selecione o Cliente', data: opcoes.clientes };
      case 'pedido':
        return { title: 'Selecione o Pedido', data: opcoes.pedidos };
      case 'unidade':
        return { title: 'Selecione a Unidade', data: opcoes.unidades };
      case 'os':
        return { title: 'Selecione a OS', data: opcoes.os };
      default:
        return { title: '', data: [] };
    }
  };

  const modalConfig = getModalConfig();

  // Helper para pegar o texto correto para exibir no botão (Nome vs ID)
  const getLabel = (valor, map) => {
    if (!valor) return null;
    return map && map.has(valor) ? map.get(valor) : valor;
  };

  return (
    <View>
      {/* 1. SELETOR DE CLIENTE */}
      <PickerDisplay
        label="Cliente"
        placeholder="Selecione um cliente..."
        value={getLabel(selecoes.cliente, display.clienteMap)}
        onPress={() => setModalType('cliente')}
      />

      {/* 2. SELETOR DE PEDIDO (Desabilitado sem cliente) */}
      <PickerDisplay
        label="Pedido"
        placeholder="Selecione o pedido..."
        value={selecoes.pedido}
        disabled={!selecoes.cliente}
        onPress={() => setModalType('pedido')}
      />

      {/* 3. SELETOR DE UNIDADE (Desabilitado sem pedido) */}
      <PickerDisplay
        label="Unidade"
        placeholder="Selecione a unidade..."
        value={selecoes.unidade}
        disabled={!selecoes.pedido}
        onPress={() => setModalType('unidade')}
      />

      {/* 4. SELETOR DE OS (Desabilitado sem unidade) */}
      <PickerDisplay
        label="Ordem de Serviço (OS)"
        placeholder="Selecione a OS..."
        value={getLabel(selecoes.os, display.osMap)}
        disabled={!selecoes.unidade}
        onPress={() => setModalType('os')}
      />

      {/* MODAL ÚNICO (Reutilizável) */}
      <SelectorModal
        visible={!!modalType}
        onClose={closeModal}
        title={modalConfig.title}
        options={modalConfig.data}
        onSelect={(valor) => handleSelect(modalType, valor)}
        labelKey="label" // O Hook já retorna { label, value }
        valueKey="value"
      />
    </View>
  );
}