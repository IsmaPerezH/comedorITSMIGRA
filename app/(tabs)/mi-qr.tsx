// app/(tabs)/mi-qr.tsx
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { QRGenerator } from '@/services/qrGenerator';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

export default function MiQRScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const { obtenerBeneficiarioPorId, beneficiarios, loading } = useStorage();

  // ID del beneficiario actual (simulado por ahora)
  const [beneficiarioId, setBeneficiarioId] = useState('1');

  const [qrValue, setQrValue] = useState<string>('');
  const [qrWebDataUrl, setQrWebDataUrl] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [permisosMedia, setPermisosMedia] = useState(false);

  // Referencia para capturar el QR como imagen
  let qrRef: any = useRef(null);

  // Obtener beneficiario (con fallback al primero si no existe el ID 1)
  const beneficiario =
    obtenerBeneficiarioPorId(beneficiarioId) ||
    (beneficiarios.length > 0 ? beneficiarios[0] : undefined);

  // Generar QR al cargar o cuando cambie el beneficiario
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

      // Para web, generar Data URL usando la librería 'qrcode' dinámicamente
      if (Platform.OS === 'web') {
        const QRCodeWeb = require('qrcode');
        const url = await QRCodeWeb.toDataURL(datos, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1a237e',
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

  // Compartir QR
  const compartirQR = () => {
    if (!beneficiario || !qrValue) return;
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'La función de compartir imagen no está disponible en web');
      return;
    }
    qrRef.toDataURL(async (data: string) => {
      try {
        // @ts-ignore
        const filename = FileSystem.cacheDirectory + `qr_${beneficiario.matricula}.png`;
        await FileSystem.writeAsStringAsync(filename, data, { encoding: 'base64' });
        await Sharing.shareAsync(filename, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir mi QR',
        });
      } catch (error) {
        console.error('Error compartiendo QR:', error);
        Alert.alert('Error', 'No se pudo compartir el código QR');
      }
    });
  };

  // Guardar QR en galería
  const guardarEnGaleria = () => {
    if (!beneficiario || !qrValue || Platform.OS === 'web') {
      Alert.alert('Info', 'Esta función solo está disponible en dispositivos móviles');
      return;
    }
    if (!permisosMedia) {
      Alert.alert('Permisos requeridos', 'Necesitas permitir el acceso a la galería para guardar el QR');
      solicitarPermisosMedia();
      return;
    }
    setGuardando(true);
    qrRef.toDataURL(async (data: string) => {
      try {
        // @ts-ignore
        const filename = FileSystem.cacheDirectory + `qr_${beneficiario.matricula}.png`;
        await FileSystem.writeAsStringAsync(filename, data, { encoding: 'base64' });
        const asset = await MediaLibrary.createAssetAsync(filename);
        await MediaLibrary.createAlbumAsync('CHA A KASKUA', asset, false);
        Alert.alert('Éxito', 'QR guardado en tu galería');
      } catch (error) {
        console.error('Error guardando QR:', error);
        Alert.alert('Error', 'No se pudo guardar el QR en la galería');
      } finally {
        setGuardando(false);
      }
    });
  };

  // Refrescar QR
  const refrescarQR = () => {
    generarQR();
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!beneficiario) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="person-remove" size={48} color="#ccc" />
        <Text style={styles.errorText}>No se encontró información del beneficiario</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Recargar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Código QR</Text>
        <Text style={styles.subtitle}>Muéstrame al administrador</Text>
        {/* Botón Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Información del usuario */}
      <View style={styles.userInfoCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#1a237e" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{beneficiario.nombre}</Text>
          <Text style={styles.userMatricula}>Matrícula: {beneficiario.matricula}</Text>
          <Text style={styles.userStatus}>
            {beneficiario.activo ? '✅ Activo' : '❌ Inactivo'}
          </Text>
        </View>
      </View>

      {/* Código QR */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Mi Código de Asistencia</Text>

          {cargando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a237e" />
              <Text style={styles.loadingText}>Generando código QR...</Text>
            </View>
          ) : qrValue ? (
            <>
              <View style={styles.qrCodeContainer}>
                {Platform.OS === 'web' ? (
                  // Renderizado para Web usando imagen
                  qrWebDataUrl ? (
                    <Image
                      source={{ uri: qrWebDataUrl }}
                      style={{ width: width * 0.6, height: width * 0.6 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <ActivityIndicator size="small" color="#1a237e" />
                  )
                ) : (
                  // Renderizado para Móvil usando SVG
                  <QRCode
                    value={qrValue}
                    size={width * 0.6}
                    color="#1a237e"
                    backgroundColor="white"
                    getRef={(c) => (qrRef = c)}
                  />
                )}
              </View>

              <View style={styles.qrInfo}>
                <Text style={styles.qrCodeText}>
                  {QRGenerator.formatearMatriculaQR(beneficiario.matricula)}
                </Text>
                <Text style={styles.qrHint}>Escanea este código para registrar mi asistencia</Text>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#f44336" />
              <Text style={styles.errorText}>Error generando QR</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refrescarQR}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={compartirQR}
            disabled={cargando || !qrValue}
          >
            <Ionicons name="share-social" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={guardarEnGaleria}
            disabled={cargando || !qrValue || guardando}
          >
            {guardando ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Ionicons name="download" size={24} color="#4CAF50" />
            )}
            <Text style={styles.actionText}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={refrescarQR}
            disabled={cargando}
          >
            <Ionicons name="refresh" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instrucciones */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instrucciones de Uso:</Text>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionBold}>Acude al comedor</Text> en tu horario correspondiente
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionBold}>Muestra este QR</Text> al administrador
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            El administrador <Text style={styles.instructionBold}>escaneará tu código</Text>
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>4</Text>
          </View>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionBold}>¡Listo!</Text> Tu asistencia queda registrada
          </Text>
        </View>
      </View>

      {/* Información de seguridad */}
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
        <Text style={styles.securityText}>
          Este código es personal e intransferible. No lo compartas con otras personas.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userMatricula: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  qrContainer: {
    padding: 20,
  },
  qrCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8eaf6',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 80,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionBold: {
    fontWeight: '600',
    color: '#333',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 18,
  },
});