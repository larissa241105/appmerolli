import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const ButtonData = [
   { title: 'Bipar Qrcode do cliente', color: '#1b771eff' },
   { title: 'Fotografar Qrcode do cliente', color: '#215f92ff' },
   { title: 'Fotografar Qrcode do cliente 2', color: '#1d8c9bff' },
   { title: 'Fotografar frente do produto', color: '#b17213ff' },
   { title: 'Fotografar lateral do produto', color: '#8a299bff' },
   { title: 'Bipar Qrcode antigo do cliente', color: '#a42f26ff' },
   { title: 'Cadastro Do Ativo', color: '#3f3f3fff' },
];

const API_BASE_URL = 'https://orca-app-kokvo.ondigitalocean.app';

export default function HomeScreen() {

  const [nomeCliente, setNomeCliente] = useState(null);
  const [etiquetaSalva, setEtiquetaSalva] = useState(null);
      const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);

    const cnpj = params.cnpj || params.cliente;

    const COMANDOS_INTERNOS = [
  'FOTO_QRCODE', 
  'FOTO_QRCODE2', 
  'FOTO_LATERAL', 
  'FOTO_FRENTE',
  'null', 
  'undefined'
];

     useEffect(() => {
  const codigoRecebido = params.tag || params.etiqueta;

  if (codigoRecebido && !COMANDOS_INTERNOS.includes(codigoRecebido)) {
    console.log("Etiqueta VÁLIDA salva na memória:", codigoRecebido);
    setEtiquetaSalva(codigoRecebido);
  }
}, [params]);

  useEffect(() => {
    const fetchNomeCliente = async () => {
      if (params.nomeCliente && params.nomeCliente !== 'null') {
          setNomeCliente(params.nomeCliente);
          return;
      }

      if (!cnpj) {
        console.log("⚠️ AVISO: O CNPJ (cliente) não foi recebido nos parâmetros!");
        setNomeCliente("Cliente não selecionado");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Buscando cliente para CNPJ:", cnpj);
        const response = await fetch(`${API_BASE_URL}/visualizarcliente/${cnpj}`);
        
        if (response.ok) {
          const data = await response.json();
          const nomeEncontrado = data.nome_fantasia || data.razao_social;
          setNomeCliente(nomeEncontrado);
        } else {
          setNomeCliente("Cliente não identificado");
        }
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        setNomeCliente("Erro de conexão");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNomeCliente();
  }, [cnpj, params.nomeCliente]);

   console.log("Tela HOME recebeu os parâmetros:", params);

   const paramsParaNavegacao = {
        ...params,
        nomeCliente: nomeCliente ,
        tag: etiquetaSalva
    };

   const handleButtonPress = (title) => {

     let tipoFotoTag = null;

     if (title === 'Cadastro Do Ativo') {
        router.push({
          pathname: 'cadastroScreen',
          params: params 
        });
        return;
     } 
     else if (title === 'Bipar Qrcode do cliente') {
        router.push({
          pathname: 'qrcodeScreen',
          params: params 
        });
        return;
     }
     else if (title === 'Bipar Qrcode antigo do cliente') {
        router.push({
          pathname: 'qrcodeScreenAntigo',
          params: params 
        });
        return;
     }
   
     else if (title === 'Fotografar Qrcode do cliente') {
        tipoFotoTag = 'FOTO_QRCODE';
     } 
     else if (title === 'Fotografar Qrcode do cliente 2') {
        tipoFotoTag = 'FOTO_QRCODE2';
     } 
     else if (title === 'Fotografar frente do produto') {
        tipoFotoTag = 'FOTO_FRENTE';
     } 
     else if (title === 'Fotografar lateral do produto') {
        tipoFotoTag = 'FOTO_LATERAL';
     }
     else {
        console.log(`Botão "${title}" pressionado. Adicione a lógica de navegação.`);
     }

     if (tipoFotoTag) {
      
     const etiquetaCliente = etiquetaSalva || params.tag; 

      if (!etiquetaCliente) {
        Alert.alert(
          "Atenção", 
          "TAG do cliente não encontrada. Por favor, leia o QR Code do cliente primeiro."
        );
        return; 
      }

   
        router.push({
          pathname: 'fotoScreen',
          params: { 
               ...paramsParaNavegacao,

               tag: tipoFotoTag, 

            etiqueta: etiquetaCliente 
          } 
        });
     }
   };

  return (
    <>
   <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Home</Text>
            </View>
      
      <View style={styles.container}>
        <View style={styles.nomedocliente}>
     <Text style={styles.clientLabel}>
            {isLoading ? "Carregando..." : (nomeCliente || "Aguardando dados...")}
          </Text>
          
          <Text style={{color: 'gray', fontSize: 10, textAlign: 'center'}}>
             CNPJ: {cnpj || "Vazio"}
          </Text>
       </View>
          
        <ScrollView contentContainerStyle={styles.containerButton}>
          {ButtonData.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.button, { backgroundColor: item.color }]} 
              onPress={() => handleButtonPress(item.title)}
            >
              <Text style={styles.buttonText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'center', 
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
    
  containerButton: {
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 10, 
  },

  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '85%', 
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
  },
  
  nomedocliente:{
    alignItems: 'center',
    top: '3%'
  },

  clientLabel:{
    fontSize: 20,
    fontWeight: '700',
  
  },
});