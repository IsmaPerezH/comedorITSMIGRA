
// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function RoleSelectionScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/images/comedor.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300)} style={styles.title}>
          CHA'A KASKUA
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(400)} style={styles.subtitle}>
          Sistema de Gestión del Comedor
        </Animated.Text>
      </View>

      <View style={styles.content}>
        <Link href="/login" asChild>
          <TouchableOpacity activeOpacity={0.9} style={styles.touchable}>
            <Animated.View entering={FadeInDown.delay(500)} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: '#FED7AA' }]}>
                <Ionicons name="person" size={32} color="#ff6a1aff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Soy Beneficiario</Text>
                <Text style={styles.cardDescription}>
                  Consulta tu saldo, roles y registra tu asistencia con QR.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </Animated.View>
          </TouchableOpacity>
        </Link>

        <Link href="/login" asChild>
          <TouchableOpacity activeOpacity={0.9} style={styles.touchable}>
            <Animated.View entering={FadeInDown.delay(600)} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: '#E5E7EB' }]}>
                <Ionicons name="settings" size={32} color="#1F2937" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Soy Administrador</Text>
                <Text style={styles.cardDescription}>
                  Gestiona beneficiarios, reportes y el control del comedor.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </Animated.View>
          </TouchableOpacity>
        </Link>
      </View>

      <Animated.View entering={FadeInDown.delay(800)} style={styles.footer}>
        <Text style={styles.footerText}>
          Instituto Tecnológico Superior de San Miguel El Grande
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#78716C',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  touchable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#78716C',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#A8A29E',
    textAlign: 'center',
    fontWeight: '500',
  },
});
