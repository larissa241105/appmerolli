import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

// Lista de dados dos botões (pode ficar fora, pois não depende de estado ou hooks)
const ButtonData = [
  { title: 'Bipar Qrcode do cliente', color: '#1b771eff' },
  { title: 'Fotografar Qrcode do cliente', color: '#215f92ff' },
  { title: 'Fotografar frente do produto', color: '#b17213ff' },
  { title: 'Fotografar lateral do produto', color: '#8a299bff' },
  { title: 'Fotografar a costa do produto', color: '#1d8c9bff' },
  { title: 'Bipar Qrcode antigo do cliente', color: '#a42f26ff' },
  { title: 'Cadastro Do Ativo', color: '#3f3f3fff' },
];

export default function HomeScreen() {
  
  // ✅ CORREÇÃO: Mova o hook para DENTRO do componente
  const params = useLocalSearchParams();

  // ✅ CORREÇÃO: Mova a função que usa 'params' para DENTRO também
  const handleButtonPress = (title) => {
    if (title === 'Cadastro Do Ativo') {
      router.push({
        pathname: 'cadastroScreen', // Certifique-se que o nome do arquivo/rota está correto
        params: params // Agora 'params' está acessível e correto
      });
    } else if (title === 'Bipar Qrcode do cliente' || title === 'Bipar Qrcode antigo do cliente') {
      router.push('qrcodeScreen');
    } else {
      console.log(`Botão "${title}" pressionado. Adicione a lógica de navegação.`);
    }
  };

  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'MerolliSoft',
          headerBackTitle: '',
          headerStyle: { backgroundColor: '#000' },
          headerTitleStyle: { fontWeight: 'bold', color: '#fff' },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.container}>
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
  },
  
  containerButton: {
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 20, 
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '85%', // Largura fixa
    alignItems: 'center',
    marginBottom: 20,
   
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
  },
});