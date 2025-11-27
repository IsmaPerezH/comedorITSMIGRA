// app/(tabs)/mi-qr.tsx
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { QRGenerator } from '@/services/qrGenerator';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function MiQRScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { obtenerBeneficiarioPorId, beneficiarios, loading } = useStorage();

  const beneficiarioId = user?.role === 'student' ? user.beneficiarioId : null;
  const [qrValue, setQrValue] = useState<string>('');
  const [qrWebDataUrl, setQrWebDataUrl] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [permisosMedia, setPermisosMedia] = useState(false);

  let qrRef: any = useRef(null);

  const beneficiario = beneficiarioId ? obtenerBeneficiarioPorId(beneficiarioId) : undefined;

  useEffect(() => {
    if (!loading && beneficiario) {
      generarQR();
    }
    solicitarPermisosMedia();
  }, [loading, beneficiario]);

  const solicitarPermisosMedia = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermisosMedia(status === 'granted');
    }
  };

  const generarQR = async () => {
    if (!beneficiario) return;
    setCargando(true);
    try {
      const datos = QRGenerator.generarDatosQR(
        beneficiario.matricula,
        beneficiario.nombre
      );
      setQrValue(datos);

      if (Platform.OS === 'web') {
        const QRCodeWeb = require('qrcode');
        const url = await QRCodeWeb.toDataURL(datos, {
          width: 300,
          margin: 2,
          color: {
            dark: '#2563EB',
            light: '#ffffff',
          },
        });
        setQrWebDataUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el código QR');
      console.error('Error generando QR:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!beneficiario) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyIcon}>
          <Ionicons name="person-remove-outline" size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>No se encontró información</Text>
        <Text style={styles.emptySubtitle}>No se pudo cargar tu perfil de beneficiario</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Recargar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="qr-code" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Mi Código QR</Text>
              <Text style={styles.headerSubtitle}>Identificación personal</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Usuario */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View style={[styles.avatar, { backgroundColor: beneficiario.activo ? '#EFF6FF' : '#F3F4F6' }]}>
              <Text style={[styles.avatarText, { color: beneficiario.activo ? '#2563EB' : '#9CA3AF' }]}>
                {beneficiario.nombre.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{beneficiario.nombre}</Text>
              <View style={styles.userMeta}>
                <Ionicons name="card-outline" size={14} color="#6B7280" />
                <Text style={styles.userMatricula}>{beneficiario.matricula}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: beneficiario.activo ? '#ECFDF5' : '#FEF2F2' }]}>
              <View style={[styles.statusDot, { backgroundColor: beneficiario.activo ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.statusText, { color: beneficiario.activo ? '#059669' : '#DC2626' }]}>
                {beneficiario.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tarjeta del QR */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <Ionicons name="qr-code-outline" size={24} color="#2563EB" />
            <Text style={styles.qrTitle}>Código de Asistencia</Text>
          </View>

          {cargando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Generando código QR...</Text>
            </View>
          ) : qrValue ? (
            <>
              <View style={styles.qrCodeContainer}>
                {Platform.OS === 'web' ? (
                  qrWebDataUrl ? (
                    <Image
                      source={{ uri: qrWebDataUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <ActivityIndicator size="small" color="#2563EB" />
                  )
                ) : (
                  <QRCode
                    value={qrValue}
                    size={width * 0.6}
                    color="#2563EB"
                    backgroundColor="white"
                    getRef={(c) => (qrRef = c)}
                  />
                )}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Error al generar el código QR</Text>
              <TouchableOpacity style={styles.retryButton} onPress={generarQR}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userMatricula: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  qrCodeContainer: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  qrImage: {
    width: width * 0.6,
    height: width * 0.6,
  },
  qrInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    gap: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
});