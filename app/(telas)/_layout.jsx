import { Stack } from 'expo-router';

export default function TelasLayout() {
  return (
    <Stack >

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
           headerShown: false
        }} 
      />

        <Stack.Screen 
        name="fotoScreen" 
        options={{ 
           headerShown: false
        }} 
      />

      <Stack.Screen 
        name="splashScreen" 
       options={{
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
      <Stack.Screen 
        name="escolhaOSCadastro" 
       options={{
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
       <Stack.Screen 
        name="escolhaOsConsulta" 
       options={{
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
      <Stack.Screen 
        name="listadeProdutoInventario" 
       options={{
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />
      <Stack.Screen 
        name="editarProdutoInventario" 
       options={{
        gestureEnabled: false,
        headerLeft: () => null,
       }}
      
      />

      <Stack.Screen 
        name="qrcodeScreen" 
      
      
      />
      
    </Stack>
  );
}