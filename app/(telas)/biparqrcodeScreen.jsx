import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function BiparQrCodeScreen() {
 
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); 

    const CADASTRO_ROUTE = 'home'; // **Ajuste para a sua rota real**
    const { osId, pedidoNumero } = useLocalSearchParams();
    console.log("Tela QRCODE recebeu os parâmetros:", { osId, pedidoNumero });

const handleBarCodeScanned = ({ type, data }) => {
     if (!scanned) {
        setScanned(true);
        Alert.alert(
          "Código de Barras Lido!",
          `Tipo: ${type}\nDado: ${data}`,
          [
             {
               text: "OK",
               onPress: () => {
                   setScanned(false);

                   const paramsParaNavegar = { 
                tag: data,
                osId: osId,           // vem dos params recebidos
                pedidoNumero: pedidoNumero  // vem dos params recebidos
              };

        console.log("Tela QRCODE vai enviar para Cadastro:", paramsParaNavegar);
                  router.navigate({
                    pathname: CADASTRO_ROUTE,
                    params: paramsParaNavegar
                  });
               }
             },
          ]
        );
     }
   };

  if (!permission) {
    return <View style={styles.container}><Text>Aguardando permissão...</Text></View>;
  }

  if (!permission.granted) {

    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para acessar a câmera</Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leitor de Código de Barras</Text>

   
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={'back'} 
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13'] }} 
        />
      </View>
      
      <View style={styles.controlsContainer}>
   
        {scanned ? (
          <Button title={'Ler Novamente'} onPress={() => setScanned(false)} />
        ) : null}

   
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: '20%',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraContainer: {
    width: '90%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    width: '90%',
    alignItems: 'center',
  },

});