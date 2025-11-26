// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserHomeScreen() {
  const userInfo = {
    name: 'Brenda Vásquez',
    studentId: '22105081',
    asistencias: 14,
    rolesPendientes: 2
  };

  const proximosRoles = [
    { tipo: 'Cocina', fecha: '25 Nov 2025', completado: false },
    { tipo: 'Aseo', fecha: '28 Nov 2025', completado: false }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>¡Hola, {userInfo.name}!</Text>
          <Text style={styles.userId}>Matrícula: {userInfo.studentId}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={50} color="#fff" />
        </View>
      </View>

      {/* Botón de QR Principal */}
      <Link href="/qr-scanner" asChild>
        <TouchableOpacity style={styles.qrButton}>
          <Ionicons name="qr-code" size={32} color="#fff" />
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrMainText}>Escanear QR Asistencia</Text>
            <Text style={styles.qrSubText}>Registro rápido y seguro</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </Link>

      {/* Estadísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userInfo.asistencias}</Text>
          <Text style={styles.statLabel}>Asistencias</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userInfo.rolesPendientes}</Text>
          <Text style={styles.statLabel}>Roles Pendientes</Text>
        </View>
      </View>

      {/* Próximos Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Roles</Text>
        {proximosRoles.map((rol, index) => (
          <View key={index} style={styles.roleItem}>
            <View style={styles.roleIcon}>
              <Ionicons 
                name={rol.tipo === 'Cocina' ? 'restaurant' : 'sparkles'} 
                size={20} 
                color="#1a237e" 
              />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleType}>{rol.tipo}</Text>
              <Text style={styles.roleDate}>{rol.fecha}</Text>
            </View>
            <View style={[styles.statusBadge, !rol.completado && styles.pendingBadge]}>
              <Text style={styles.statusText}>
                {rol.completado ? 'Completado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="time" size={24} color="#1a237e" />
            <Text style={styles.actionText}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={24} color="#1a237e" />
            <Text style={styles.actionText}>Recordatorios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={24} color="#1a237e" />
            <Text style={styles.actionText}>Ayuda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  avatar: {
    marginLeft: 10,
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  qrTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  qrMainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  qrSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  roleDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#ff9800',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});