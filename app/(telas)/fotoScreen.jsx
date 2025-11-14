import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, View, Alert, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library'; 
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export default function TelaCamera() {
   const cameraRef = useRef(null);
  

   const params = useLocalSearchParams();
   const { tag } = params; 

   const [nomeDaPessoa] = useState('larissa'); 

   const [permission, requestPermission] = useCameraPermissions();
   const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions({ writeOnly: true });

   const [photo, setPhoto] = useState(null);
   const [saving, setSaving] = useState(false);
   const [facing, setFacing] = useState("back");

   if (!permission) {
     return <View style={styles.container} />;
   }


   if (!permission.granted) {
     return (
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>
             Precisamos de sua permissão para usar a câmera.
          </Text>
          <Button onPress={requestPermission} title="Conceder Permissão" />
        </View>
     );
   }

   const takePicture = async () => {
     if (!cameraRef.current) return;
     try {
        const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPhoto(result.uri);
     } catch (err) {
        Alert.alert("Erro", "Não foi possível tirar a foto.");
     }
   };

 const handleConfirmPhoto = async () => {

     if (!photo) {
       Alert.alert("Erro", "Nenhuma foto para salvar.");
       return;
     }

     setSaving(true);

     try {
       // --- 1. Geração do nome do arquivo (Seu código original, está perfeito) ---
       const now = new Date();
       const dia = String(now.getDate()).padStart(2, '0');
       const mes = String(now.getMonth() + 1).padStart(2, '0');
       const ano = now.getFullYear();
       const hora = String(now.getHours()).padStart(2, '0');
       const min = String(now.getMinutes()).padStart(2, '0');
       const seg = String(now.getSeconds()).padStart(2, '0');

       // Usamos a 'tag' vinda dos params e 'SEMTAG' como fallback
       const filename = `${tag || 'SEMTAG'}_${dia}-${mes}-${ano}_${hora}-${min}-${seg}.jpg`;
 
       // --- 2. Copiar/Mover o Arquivo (Seu código original, está perfeito) ---
       const destinationDir = FileSystem.documentDirectory + 'CameraAssets/';
       const newPath = destinationDir + filename;

       await FileSystem.makeDirectoryAsync(destinationDir, { intermediates: true });

       await FileSystem.copyAsync({
         from: photo,
         to: newPath,
       });

       await AsyncStorage.setItem('pendingPhotoUri', newPath);
       
       // --- 4. (NOVO) Voltar para a tela de Cadastro ---
       if (router.canGoBack()) {
         router.back();
       }

     } catch (err) {
       console.error("Erro ao preparar foto:", err);
       Alert.alert("Erro", "Não foi possível preparar a foto. Tente novamente.");
     } finally {
       setSaving(false);
     }
   };

   // Helper function para renomear e salvar (requer expo-file-system)
   const saveWithCustomName = async (uri, customFilename) => {
     // **⚠️ ATENÇÃO:** Para que esta função funcione, você deve importar:
     // import * as FileSystem from 'expo-file-system'; 

     const destinationDir = FileSystem.documentDirectory + 'CameraAssets/';

     await FileSystem.makeDirectoryAsync(destinationDir, { intermediates: true });

     const newPath = destinationDir + customFilename;

     await FileSystem.copyAsync({
        from: uri,
        to: newPath,
     });

     return newPath;
   };


   const toggleCamera = () => {
     setFacing((prev) => (prev === "back" ? "front" : "back"));
   };

   // 3. Renderização principal (Câmera ou Preview da Foto)
   return (
     <View style={styles.container}>
        {photo ? (
          // Mostra o preview da foto tirada
          <ImageBackground source={{ uri: photo }} style={styles.preview}>
             {saving && (
               <View style={styles.overlay}>
                  <ActivityIndicator size="large" color="#fff" />
               </View>
             )}
             <View style={styles.previewButtons}>
               <TouchableOpacity onPress={() => setPhoto(null)} style={styles.iconBtn}>
                  <MaterialIcons name="cancel" size={42} color="#fff" />
                  <Text style={styles.iconText}>Tentar Novamente</Text>
               </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirmPhoto} style={styles.iconBtn}>
       <MaterialIcons name="check-circle" size={42} color="#fff" />
       <Text style={styles.iconText}>Salvar</Text> 
   </TouchableOpacity>
             </View>
          </ImageBackground>
        ) : (
          // Mostra a câmera ao vivo
          <View style={{ flex: 1 }}>
             <CameraView
               style={StyleSheet.absoluteFill} // Câmera ocupa todo o espaço
               facing={facing}
               ref={cameraRef}
               playSoundOnCapture={false}
             />
             {/* BOTÕES FICAM AQUI, SOBRE A CÂMERA */}
             <View style={styles.overlayContainer}>
               <TouchableOpacity style={styles.switchCam} onPress={toggleCamera}>
                  <MaterialIcons name="flip-camera-ios" size={32} color="#fff" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
             </View>
          </View>
        )}
     </View>
   );
}

// Estilos Atualizados
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: { color: "#fff", fontSize: 18, marginBottom: 20, textAlign: "center" },
  camera: { // Este estilo não é mais necessário
    // flex: 1,
    // justifyContent: "flex-end",
    // alignItems: "center",
  },
  // NOVO ESTILO para o container dos botões sobre a câmera
  overlayContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  switchCam: {
    position: "absolute",
    top: 60, // Aumentei um pouco para não ficar colado na borda
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
  },
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: "#fff",
    marginBottom: 35,
    borderWidth: 4,
    borderColor: "#aaa",
  },
  preview: { flex: 1, justifyContent: "flex-end" },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  iconBtn: { alignItems: "center" },
  iconText: { color: "#fff", marginTop: 5 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});