// app/(tabs)/_layout.tsx - REEMPLAZAR roles por recordatorios
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a237e',
        headerStyle: {
          backgroundColor: '#1a237e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="mi-qr"
        options={{
          title: 'Mi QR',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="pdfs"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document' : 'document-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="asistencia"
        options={{
          title: 'Asistencia',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="recordatorios"
        options={{
          title: 'Recordatorios',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}