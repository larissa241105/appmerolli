import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert,Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const QrcodeScreen = () => {
    // Pegamos o inset do topo para o header não ficar embaixo da barra de status (bateria/hora)
    const insets = useSafeAreaInsets();
    
    const [plaquetaAtualValue, setplaquetaAtualValue] = useState('');
    const params = useLocalSearchParams();

    const CADASTRO_ROUTE = 'home'; 

    const handleScanQrcode = () => {
        router.push({
            pathname: 'biparqrcodeScreen',
            params: params 
        });
    };

    const handleSearchPlaqueta = () => {
        if (!plaquetaAtualValue.trim()) {
            Alert.alert('Atenção', 'Por favor, digite o número da plaqueta.');
            return;
        }
       
        console.log(`Consultando plaqueta: ${plaquetaAtualValue}`);

        router.navigate({
            pathname: CADASTRO_ROUTE,
            params: {
                ...params, 
                tag: plaquetaAtualValue.trim(), 
            }
        }); 
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffffff' }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color="#ffffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Digitar Tag</Text>
            </View>
<KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
               
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    keyboardShouldPersistTaps="handled"
                >
                <View style={styles.contentContainer}>
                    <TouchableOpacity
                        style={styles.qrButton}
                        onPress={handleScanQrcode}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.qrButtonTitle}>Bipar QR Code do Cliente</Text>
                        <Image
                            source={require('../../assets/images/qrcode.png')}
                            style={styles.qrImage}
                        />
                        <Text style={styles.qrButtonSubtitle}>Toque no ícone para abrir o leitor</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OU</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Digitar Número da Plaqueta</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 123456"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={10} 
                            value={plaquetaAtualValue}
                            onChangeText={setplaquetaAtualValue} 
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSearchPlaqueta}>
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
             
               
            </View>
             </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilo do Header Personalizado
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
 scrollContent: {
        flexGrow: 1,
        backgroundColor: '#ffffffff',
        alignItems: 'center', 
        paddingHorizontal: 20,
        paddingTop: 30,  
        paddingBottom: 20, // Espaço extra no final para garantir que o botão não cole no teclado
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffffff',
    },

contentContainer: {
        width: '100%',
        alignItems: 'center',
    },


    // --- Seus estilos originais abaixo ---
    qrButton: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 25,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    qrButtonTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    qrImage: {
        width: 150, // Reduzi um pouco para caber melhor em telas pequenas
        height: 150,
        marginBottom: 10,
        resizeMode: 'contain',
    },
    qrButtonSubtitle: {
        fontSize: 12,
        color: '#a20606ff',
        fontWeight: '700',
        marginTop: 5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
    },
    inputSection: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f9f9f9',
        color: '#000',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#ccc',
        fontWeight: '500',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#0a3e0cff',
        paddingVertical: 14,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default QrcodeScreen;