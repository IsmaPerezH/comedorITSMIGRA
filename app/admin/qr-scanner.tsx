// app/admin/qr-scanner.tsx
import { useStorage } from '@/hooks/useStorage';
import { QRGenerator } from '@/services/qrGenerator';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

export default function AdminQRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const router = useRouter();
  const { registrarAsistencia, obtenerBeneficiarioPorMatricula } = useStorage();

  // Animation for the scanner line
  const translateY = useSharedValue(0);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();

    // Start scanning animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(SCAN_SIZE, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true); // Set scanned to true to prevent multiple scans

    try {
      const validacion = QRGenerator.validarQR(data);

      if (!validacion.valido) {
        Alert.alert(
          '❌ QR Inválido',
          validacion.error || 'Este código QR no es válido',
          [{ text: 'Intentar de nuevo', onPress: () => setScanned(false) }]
        );
        return;
      }

      const { datos } = validacion;
      const beneficiario = obtenerBeneficiarioPorMatricula(datos!.matricula);

      if (beneficiario) {
        // Determinar tipo de comida basado en la hora
        const horaActual = new Date().getHours();
        let tipo: 'almuerzo' | 'comida' | 'cena' = 'comida';

        if (horaActual >= 8 && horaActual < 12) {
          tipo = 'almuerzo';
        } else if (horaActual >= 12 && horaActual < 18) {
          tipo = 'comida';
        } else {
          tipo = 'cena';
        }

        // Registrar asistencia
        const asistencia = await registrarAsistencia(beneficiario.id, tipo);

        Alert.alert(
          '✅ Asistencia Registrada',
          'Beneficiario: ' + beneficiario.nombre + '\nMatrícula: ' + beneficiario.matricula + '\nTipo: ' + tipo + '\nHora: ' + asistencia.hora,
          [
            {
              text: 'Registrar siguiente',
              onPress: () => setScanned(false),
            },
            {
              text: 'Finalizar',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          '❌ Beneficiario No Encontrado',
          'El código QR es válido pero no se encontró al beneficiario con matrícula ' + datos!.matricula,
          [{ text: 'Intentar de nuevo', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'Hubo un problema al registrar la asistencia',
        [{ text: 'Intentar de nuevo', onPress: () => setScanned(false) }]
      );
    }
  };

  // Render UI based on camera permissions
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.message}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="videocam-off" size={100} color="white" />
        <Text style={styles.errorMessage}>No hay acceso a la cámara</Text>
        <Text style={styles.message}>
          Por favor, habilita los permisos de la cámara en la configuración de tu dispositivo.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        enableTorch={flashOn}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Escanear QR</Text>
          <TouchableOpacity
            onPress={() => setFlashOn(!flashOn)}
            style={[styles.controlButton, flashOn && styles.controlButtonActive]}
          >
            <Ionicons name={flashOn ? 'flash' : 'flash-off'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerContainer}>
          <View style={styles.maskTop} />
          <View style={styles.maskCenter}>
            <View style={styles.maskSide} />
            <View style={styles.scannerFrame}>
              <Animated.View style={[styles.scannerLine, animatedLineStyle]} />
            </View>
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskBottom} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.instructionText}>
            Apunta la cámara al código QR para escanearlo.
          </Text>
          {scanned && (
            <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanButton}>
              <Ionicons name="scan-circle-outline" size={24} color="white" />
              <Text style={styles.rescanText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskCenter: {
    flexDirection: 'row',
    width: '100%',
    height: SCAN_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderColor: 'white',
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'red',
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  maskBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  footer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  message: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
  errorMessage: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});