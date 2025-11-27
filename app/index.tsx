// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RoleSelectionScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>CHA&apos;A KASKUA</Text>
      <Text style={styles.subtitle}>Sistema de Gestión del Comedor</Text>

      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="restaurant" size={64} color="white" />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <View style={styles.buttonContent}>
              <Ionicons name="person" size={24} color="white" style={styles.buttonIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.buttonText}>Soy Beneficiario</Text>
                <Text style={styles.buttonSubtext}>Registrar asistencia y ver roles</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <View style={styles.buttonContent}>
              <Ionicons name="settings-sharp" size={24} color="white" style={styles.buttonIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.buttonText}>Soy Administrador</Text>
                <Text style={styles.buttonSubtext}>Gestionar comedor y reportes</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={styles.footer}>
        Instituto Tecnológico Superior de San Miguel El Grande
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4a942',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: '#2E7D32', // Darker green for admin
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to left to keep text aligned
    paddingHorizontal: 10,
  },
  buttonIcon: {
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  footer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});