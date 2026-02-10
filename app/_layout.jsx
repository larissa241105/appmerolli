// app/_layout.jsx
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

export default function RootLayout() {
  // Simule o estado de autenticação e carregamento
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use um useEffect para simular a verificação de autenticação
  // Em um projeto real, você faria uma chamada à API aqui
  useState(() => {
    setTimeout(() => {
      setIsLoading(false);
      // setIsAuthenticated(true); // Mude para 'true' para testar a tela principal
    }, 2000);
  }, []);

  if (isLoading) {
    return <Text>Carregando...</Text>;
  }

  if (isAuthenticated) {
    // Se o usuário estiver autenticado, redirecione para as abas
    return <Redirect href="/(telaLogin)" />;
  }

  // Se o usuário não estiver autenticado, mostre a tela de autenticação (login)
  return (
    <Stack>
      <Stack.Screen name="(telaLogin)" options={{ headerShown: false }} />
      <Stack.Screen name="(telas)" options={{ headerShown: false ,headerBackTitle: '', }} />
      
    </Stack>
  );
}