// app/admin/dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const {
    beneficiarios,
    asistencias,
    roles,
    obtenerAsistenciasDelDia,
    limpiarDatos
  } = useStorage();

  // Estadísticas en tiempo real
  const estadisticas = {
    totalBeneficiarios: beneficiarios.length,
    activosHoy: obtenerAsistenciasDelDia().length,
    rolesPendientes: roles.filter(r => r.estado === 'pendiente' || r.estado === 'proximo').length,
    porcentajeAsistencia: beneficiarios.length > 0
      ? Math.round((obtenerAsistenciasDelDia().length / beneficiarios.length) * 100)
      : 0,
  };

  // Asistencias de hoy
  const asistenciasHoy = obtenerAsistenciasDelDia();

  // Función para limpiar datos (solo desarrollo)
  const handleLimpiarDatos = () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Estás seguro de que quieres limpiar todos los datos? Esto es solo para desarrollo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => limpiarDatos()
        },
      ]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Panel Administrador</Text>
          <Text style={styles.subtitle}>CHA&apos;A KASKUA</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={20} color="white" />
            <Text style={styles.adminText}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas Principales */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="people" size={24} color="white" />
          </View>
          <Text style={styles.statNumber}>{estadisticas.totalBeneficiarios}</Text>
          <Text style={styles.statLabel}>Total Beneficiarios</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
          <Text style={styles.statNumber}>{estadisticas.activosHoy}</Text>
          <Text style={styles.statLabel}>Asistencias Hoy</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="list" size={24} color="white" />
          </View>
          <Text style={styles.statNumber}>{estadisticas.rolesPendientes}</Text>
          <Text style={styles.statLabel}>Roles Pendientes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#9C27B0' }]}>
            <Ionicons name="trending-up" size={24} color="white" />
          </View>
          <Text style={styles.statNumber}>{estadisticas.porcentajeAsistencia}%</Text>
          <Text style={styles.statLabel}>Asistencia Hoy</Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <Link href="/admin/qr-scanner" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="qr-code" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Escanear QR</Text>
              <Text style={styles.actionSubtext}>Registrar asistencias</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/beneficiarios" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="people" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Beneficiarios</Text>
              <Text style={styles.actionSubtext}>Gestionar usuarios</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/reportes" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="bar-chart" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Reportes</Text>
              <Text style={styles.actionSubtext}>Ver estadísticas</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/roles" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="list" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Roles</Text>
              <Text style={styles.actionSubtext}>Gestionar turnos</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/carga-roles" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="document" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Cargar Roles PDF</Text>
              <Text style={styles.actionSubtext}>Importar desde archivo</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/gestion-pdfs" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="document" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Gestionar PDFs</Text>
              <Text style={styles.actionSubtext}>Subir documentos</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Asistencias Recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asistencias de Hoy</Text>
          <Text style={styles.seeAllText}>
            {asistenciasHoy.length} de {estadisticas.totalBeneficiarios}
          </Text>
        </View>

        {asistenciasHoy.length > 0 ? (
          <View style={styles.asistenciasList}>
            {asistenciasHoy.slice(0, 5).map((asistencia) => {
              const beneficiario = beneficiarios.find(b => b.id === asistencia.beneficiarioId);
              return (
                <View key={asistencia.id} style={styles.asistenciaItem}>
                  <View style={styles.asistenciaInfo}>
                    <Text style={styles.beneficiarioName}>
                      {beneficiario?.nombre || 'Desconocido'}
                    </Text>
                    <Text style={styles.asistenciaDetail}>
                      {asistencia.tipo} • {asistencia.hora}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: asistencia.tipo === 'comida' ? '#2196F3' : '#9C27B0' }
                  ]}>
                    <Text style={styles.statusText}>
                      {asistencia.tipo.charAt(0).toUpperCase() + asistencia.tipo.slice(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
            {asistenciasHoy.length > 5 && (
              <TouchableOpacity style={styles.verMasButton}>
                <Text style={styles.verMasText}>
                  Ver {asistenciasHoy.length - 5} más...
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No hay asistencias hoy</Text>
            <Text style={styles.emptyStateSubtext}>
              Usa el escáner QR para registrar asistencias
            </Text>
          </View>
        )}
      </View>

      {/* Información del Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Sistema</Text>
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="server" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Almacenamiento Local</Text>
              <Text style={styles.infoText}>Datos guardados en el dispositivo</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="time" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Actualizado</Text>
              <Text style={styles.infoText}>
                {new Date().toLocaleTimeString('es-MX')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Solo para desarrollo - Limpiar datos */}
      <View style={styles.devSection}>
        <TouchableOpacity style={styles.devButton} onPress={handleLimpiarDatos}>
          <Ionicons name="trash" size={20} color="#f44336" />
          <Text style={styles.devButtonText}>Limpiar Datos (Desarrollo)</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    width: '47%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  asistenciasList: {
    gap: 12,
  },
  asistenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  asistenciaInfo: {
    flex: 1,
  },
  beneficiarioName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  asistenciaDetail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verMasButton: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  verMasText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  devSection: {
    padding: 20,
    alignItems: 'center',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  devButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
});