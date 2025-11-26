// app/admin/_layout.tsx - AGREGAR la nueva pantalla
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
      <Stack.Screen name="beneficiarios" options={{ headerShown: false }} />
      <Stack.Screen name="reportes" options={{ headerShown: false }} />
      <Stack.Screen name="roles" options={{ headerShown: false }} />
      <Stack.Screen name="carga-roles" options={{ headerShown: false }} />
      <Stack.Screen name="gestion-pdfs" options={{ headerShown: false }} />
    </Stack>
  );
}