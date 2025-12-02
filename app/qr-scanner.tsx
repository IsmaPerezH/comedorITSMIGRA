// app/qr-scanner.tsx
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

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const router = useRouter();

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

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    // Validar que el QR sea de CHA'A KASKUA
    if (data.startsWith('CHAASKU-')) {
      Alert.alert(
        '✅ Asistencia Registrada',
        'Código: ' + data + '\n\nLa asistencia ha sido registrada correctamente en el sistema.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              setScanned(false);
              router.back();
            },
            style: 'default',
          },
        ]
      );
    } else {
      Alert.alert(
        '⚠️ QR Inválido',
        'Este código QR no pertenece al sistema del comedor.',
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false),
            style: 'cancel',
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.message}>Solicitando acceso a la cámara...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorMessage}>Sin acceso a la cámara</Text>
          <Text style={styles.message}>
            Para escanear códigos QR, necesitamos acceso a tu cámara. Por favor habilítalo en la configuración.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        flash={flashOn ? 'on' : 'off'}
      >
        {/* Dark Overlay with Cutout */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Escanear QR</Text>
              <View style={{ width: 40 }} />
            </View>
            <Text style={styles.instructionText}>
              Coloca el código QR dentro del marco
            </Text>
          </View>

          <View style={styles.scanRow}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              {/* Corner Markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Scanning Line Animation */}
              {!scanned && (
                <Animated.View style={[styles.scanLine, animatedLineStyle]} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>

          <View style={styles.overlayBottom}>
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.controlButton, flashOn && styles.controlButtonActive]}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Ionicons
                  name={flashOn ? 'flash' : 'flash-off'}
                  size={24}
                  color={flashOn ? '#FFD700' : 'white'}
                />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Flash</Text>
            </View>

            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.rescanText}>Escanear de nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
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
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scanRow: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#ff6a1aff', // Orange
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#ff6a1aff',
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 106, 26, 0.3)',
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6a1aff',
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
    backgroundColor: '#ff6a1aff',
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