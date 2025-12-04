import { Stack } from 'expo-router';

export default function TelasLayout() {
  return (
    <Stack
    screenOptions={{
    headerStyle: { backgroundColor: '#000' },
    headerTitleStyle: { fontWeight: 'bold', color: '#fff' },
    headerTintColor: '#fff',
    headerBackVisible: false,
    headerBackTitle: '', 
  }}
    >

      <Stack.Screen 
        name="home" 
        options={{ 
          title: 'MerolliSoft', 
          headerBackTitle: '',
        }} 
      />
      <Stack.Screen 
        name="cadastroScreen" 
        options={{ 
          title: 'Cadastro do Inventário', 
          headerBackTitle: '',
        }} 
      />
      
     <Stack.Screen 
        name="biparqrcodeScreen" 
        options={{ 
          title: 'Bipar Qr Code', 
           headerShown: false
        }} 
      />
      <Stack.Screen 
        name="biparqrcodeScreenAntigo" 
        options={{ 
          title: 'Bipar Qr Code Antigo', 
           headerShown: false
        }} 
      />

        <Stack.Screen 
        name="fotoScreen" 
        options={{ 
          title: '', 
           headerShown: false
        }} 
      />

      <Stack.Screen 
        name="splashScreen" 
       options={{
        title: '', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
      <Stack.Screen 
        name="escolhaOSCadastro" 
       options={{
        title: 'O.S Cadastro', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
       <Stack.Screen 
        name="escolhaOsConsulta" 
       options={{
        title: 'O.S Consulta', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
      <Stack.Screen 
        name="listadeProdutoInventario" 
      
      
      />
      <Stack.Screen 
        name="editarProdutoInventario" 
       options={{
        title: 'Editar', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />

      <Stack.Screen 
        name="qrcodeScreen" 
        options={{
        title: 'Bipar QR Code', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      />

      <Stack.Screen 
        name="qrcodeScreenAntigo" 
        options={{
        title: 'Bipar QR Code Antigo', 
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      />
      
    </Stack>
  );
}