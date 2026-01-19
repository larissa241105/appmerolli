import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Image, 
  StatusBar,
  Platform // Necessário para distinguir iOS de Android
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library'; // Para Android (Galeria)
import * as Sharing from 'expo-sharing'; // Para iOS (Arquivos)
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // Assumindo que você usa este pacote de ícones
import { useIsFocused } from '@react-navigation/native'; // ou expo-router

export default function TelaCamera() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  
  // Hook para pegar as medidas seguras (Notch, Ilha, Home Bar)
  const insets = useSafeAreaInsets();
  
  const params = useLocalSearchParams();
  const { tag, etiqueta } = params;

  // Permissões de Câmera
  const [permission, requestPermission] = useCameraPermissions();
  
  // Permissões de Galeria (Exclusivo para Android)
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [facing, setFacing] = useState("back");

  // Verifica permissão da câmera
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          Precisamos de acesso à câmera para registrar o inventário.
        </Text>
        <TouchableOpacity style={styles.buttonPermission} onPress={requestPermission}>
          <Text style={styles.textPermission}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      // 1. Tira a foto "bruta"
      const photoResult = await cameraRef.current.takePictureAsync({ 
        quality: 1,
        skipProcessing: true 
      });

      // 2. Manipula a imagem para reduzir tamanho
      const manipResult = await ImageManipulator.manipulateAsync(
        photoResult.uri,
        [{ resize: { width: 1080 } }],
        { 
          compress: 0.5, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // 3. Salva o URI da imagem JÁ otimizada
      setPhoto(manipResult.uri);

    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível capturar a imagem.");
    }
  };

  const handleConfirmPhoto = async () => {
    if (!photo) return;
    setSaving(true);
    try {
      const now = new Date();
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      const ano = now.getFullYear();
      const hora = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const seg = String(now.getSeconds()).padStart(2, '0');

      const prefixoArquivo = etiqueta || 'SEMTAG';
      
      // Limpeza de segurança no nome do arquivo (remove barras, dois pontos, etc)
      const safeTag = prefixoArquivo.replace(/[^a-zA-Z0-9_-]/g, ''); 
      const filename = `${safeTag}_${dia}-${mes}-${ano}_${hora}-${min}-${seg}.jpg`;
      
      const destinationDir = `${FileSystem.documentDirectory}CameraAssets/`;
      const newPath = destinationDir + filename;

      // 1. Cria diretório interno se não existir
      const dirInfo = await FileSystem.getInfoAsync(destinationDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(destinationDir, { intermediates: true });
      }

      // 2. Salva na pasta do App (Necessário tanto para iOS quanto Android funcionarem)
      await FileSystem.copyAsync({ from: photo, to: newPath });

      // --- LÓGICA DE EXPORTAÇÃO (DIFERENÇA ENTRE OS E ANDROID) ---

      if (Platform.OS === 'android') {
        // === ANDROID: Tenta salvar na Galeria ===
        try {
          if (!mediaPermission?.granted) {
             const permResponse = await requestMediaPermission();
             if (permResponse.granted) {
               await MediaLibrary.createAssetAsync(newPath);
             }
          } else {
             await MediaLibrary.createAssetAsync(newPath);
          }
        } catch (e) {
          console.log("Erro ao salvar na galeria Android (não crítico):", e);
        }

      } else if (Platform.OS === 'ios') {
        // === IOS: Abre menu para Salvar em Arquivos ===
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath, {
            UTI: 'public.jpeg',
            mimeType: 'image/jpeg',
            dialogTitle: `Salvar ${filename}`
          });
        }
      }

      // 3. Salva referência no AsyncStorage e Navega
      if (tag) {
        await AsyncStorage.setItem(tag, newPath);
      } else {
        await AsyncStorage.setItem('foto_sem_tag', newPath);
      }

      if (router.canGoBack()) {
        router.back(); 
      } else {
        router.replace({ pathname: "home", params: { etiqueta: etiqueta } });
      }
    } catch (err) {
      console.error("Erro ao salvar foto:", err);
      Alert.alert("Erro", "Falha ao salvar a foto.");
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => setPhoto(null);
  const toggleCamera = () => setFacing((prev) => (prev === "back" ? "front" : "back"));
  
  const handleCancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace("home");
  };

  return (
    <View style={styles.container}>
      {/* StatusBar transparente para a câmera ocupar tudo */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {photo ? (
        // --- PREVIEW ---
        <View style={styles.previewContainer}> 
          <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="contain" />
          
          {saving && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{color: '#fff', marginTop: 10}}>Salvando...</Text>
            </View>
          )}

          {/* Padding Bottom dinâmico para respeitar a barra home do iPhone */}
          <View style={[styles.previewButtons, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity onPress={handleRetake} style={styles.iconBtn} disabled={saving}>
              <MaterialIcons name="cancel" size={42} color="#ff4444" />
              <Text style={styles.iconText}>Tentar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirmPhoto} style={styles.iconBtn} disabled={saving}>
              <MaterialIcons name="check-circle" size={42} color="#4caf50" />
              <Text style={styles.iconText}>Confirmar</Text> 
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // --- CÂMERA ---
        <View style={{ flex: 1 }}>
          {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={facing}
            ref={cameraRef}
            mode="picture"
            
          />
          )}
          {/* Botão Fechar respeitando o Top Notch */}
          <View style={[styles.topButtonContainer, { top: insets.top + 10 }]}>
            <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
               <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Controles respeitando o Bottom Bar */}
          <View style={[styles.overlayContainer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.switchCam} onPress={toggleCamera}>
              <MaterialIcons name="flip-camera-ios" size={32} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
            
            <View style={{width: 32}} /> 
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonPermission: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  textPermission: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingTop: 20,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  switchCam: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
  topButtonContainer: {
    position: 'absolute',
    left: 20,
    zIndex: 5,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  }
});