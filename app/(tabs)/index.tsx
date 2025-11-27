import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function UserHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { roles } = useStorage();
  const [comidaActual, setComidaActual] = useState('');
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) {
      setSaludo('Buenos días');
      setComidaActual('Almuerzo');
    } else if (hora < 18) {
      setSaludo('Buenas tardes');
      setComidaActual('Comida');
    } else {
      setSaludo('Buenas noches');
      setComidaActual('Cena');
    }
  }, []);

  const rolesPendientes = user && user.role === 'student'
    ? roles.filter(r => r.beneficiarioId === user.beneficiarioId && (r.estado === 'pendiente' || r.estado === 'proximo'))
    : [];

  const proximoRol = rolesPendientes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Personalizado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{saludo},</Text>
            <Text style={styles.userName}>{user?.nombre.split(' ')[0]}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nombre.charAt(0)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* Tarjeta Principal: QR y Comida */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View>
              <Text style={styles.mealLabel}>Horario de {comidaActual}</Text>
              <Text style={styles.mealTime}>
                {comidaActual === 'Almuerzo' ? '8:00 - 12:00' : comidaActual === 'Comida' ? '12:00 - 18:00' : '18:00 - 20:00'}
              </Text>
            </View>
            <View style={styles.mealIcon}>
              <Ionicons
                name={comidaActual === 'Almuerzo' ? 'sunny' : comidaActual === 'Comida' ? 'restaurant' : 'moon'}
                size={24}
                color="#F59E0B"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => router.push('/mi-qr')}
            activeOpacity={0.9}
          >
            <View style={styles.qrIconContainer}>
              <Ionicons name="qr-code" size={32} color="white" />
            </View>
            <View style={styles.qrTextContainer}>
              <Text style={styles.qrTitle}>Mostrar mi QR</Text>
              <Text style={styles.qrSubtitle}>Para registrar tu asistencia</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Tarjeta de Próximo Rol (Solo si existe) */}
        {proximoRol && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Text style={styles.sectionTitle}>Tu Próximo Rol</Text>
              <View style={[styles.roleBadge, { backgroundColor: proximoRol.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }]}>
                <Text style={[styles.roleBadgeText, { color: proximoRol.tipo === 'cocina' ? '#D97706' : '#2563EB' }]}>
                  {proximoRol.tipo.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.roleDetails}>
              <View style={styles.roleDetailItem}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.roleDetailText}>
                  {new Date(proximoRol.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <View style={styles.roleDetailItem}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.roleDetailText}>{proximoRol.horario}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Accesos Rápidos */}
        <Text style={styles.sectionLabel}>Accesos Rápidos</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/pdfs')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="document-text" size={24} color="#DC2626" />
            </View>
            <Text style={styles.actionTitle}>Roles PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/permisos')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="hand-left" size={24} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>Pedir Permiso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/actividades')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="calendar" size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionTitle}>Mi Agenda</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mealLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  mealTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qrTextContainer: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  qrSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleDetails: {
    gap: 12,
  },
  roleDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleDetailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});