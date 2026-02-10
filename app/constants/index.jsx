// constants.js (ou no topo do arquivo)
export const STORAGE_KEYS = {
  FOTO_FRENTE: 'FOTO_FRENTE',
  FOTO_LATERAL: 'FOTO_LATERAL',
  QRCODE: 'FOTO_QRCODE',
  QRCODE2: 'FOTO_QRCODE2',
  LAST_SETOR: 'last_setor',
  LAST_FAMILIA: 'last_familia',
  LAST_TIPO: 'last_tipo',
  LAST_MARCA: 'last_marca',
  LAST_STATUS: 'last_status',
  LAST_COLABORADOR: 'last_colaborador',
  LAST_CLIENTE: 'last_cliente',
  LAST_DESCRICAO: 'last_descricao',
};

export const IGNORE_TAGS = [
  'FOTO_QRCODE', 'FOTO_FRENTE', 'FOTO_LATERAL', 
  'FOTO_QRCODE2', 'null', 'undefined', ''
];