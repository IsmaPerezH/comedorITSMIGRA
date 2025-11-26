// app/admin/qr-scanner.tsx
import { useStorage } from '@/hooks/useStorage';
import { QRGenerator } from '@/services/qrGenerator';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function AdminQRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const router = useRouter();
  const { registrarAsistencia, obtenerBeneficiarioPorMatricula } = useStorage();

  // Solicitar permisos de cámara
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Función cuando se escanea un QR de beneficiario
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
  if (scanned) return;
  
  setScanned(true);
  
  try {
    // Validar QR usando el nuevo sistema
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
      const tipo = horaActual < 15 ? 'comida' : 'cena';
      
      // Registrar asistencia
      const asistencia = await registrarAsistencia(beneficiario.id, tipo);
      
      Alert.alert(
        '✅ Asistencia Registrada',
        `Beneficiario: ${beneficiario.nombre}\nMatrícula: ${beneficiario.matricula}\nTipo: ${tipo}\nHora: ${asistencia.hora}`,
        [
          {
            text: 'Registrar siguiente',
            onPress: () => setScanned(false),
          },
          {
            text: 'Finalizar',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        '❌ Beneficiario No Encontrado',
        `El código QR es válido pero no se encontró al beneficiario con matrícula ${datos!.matricula}`,
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


  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permiso para la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Sin acceso a la cámara</Text>
        <Text style={styles.message}>El administrador necesita acceso a la cámara para escanear QR.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver al Panel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Escanear QR de Beneficiarios</Text>
        <Text style={styles.subtitle}>Administrador - CHA&apos;A KASKUA</Text>
      </View>

      {/* Cámara/Scanner */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          flash={flashOn ? 'on' : 'off'}
        />

        {/* Overlay para guía de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <Text style={styles.scanText}>Escanea el QR del beneficiario</Text>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons
            name={flashOn ? 'flash' : 'flash-off'}
            size={28}
            color={flashOn ? '#FFD700' : 'white'}
          />
          <Text style={styles.controlText}>{flashOn ? 'Flash On' : 'Flash Off'}</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.rescanText}>Escanear siguiente</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.cancelText}>Volver al Panel</Text>
        </TouchableOpacity>
      </View>

      {/* Información para administrador */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Instrucciones para Administrador:</Text>
        <Text style={styles.infoText}>• Pide a cada beneficiario que muestre su QR</Text>
        <Text style={styles.infoText}>• Escanea un código a la vez</Text>
        <Text style={styles.infoText}>• La asistencia se registra automáticamente</Text>
        <Text style={styles.infoText}>• Verifica en reportes las asistencias del día</Text>
      </View>
    </View>
  );
}

// Los estilos permanecen igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a237e',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorMessage: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});