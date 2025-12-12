// app/admin/dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const {
    beneficiarios,
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

  const asistenciasHoy = obtenerAsistenciasDelDia();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => { logout(); router.replace('/'); } }
    ]);
  };

  const handleLimpiarDatos = () => {
    Alert.alert('¡Cuidado!', 'Esto borrará todos los datos. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar Todo', style: 'destructive', onPress: limpiarDatos }
    ]);
  };

  const StatCard = ({ icon, number, label, color, delay }: any) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View>
        <Text style={styles.statNumber}>{number}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );

  const ActionButton = ({ icon, title, subtitle, href, color, delay }: any) => (
    <Link href={href} asChild>
      <TouchableOpacity activeOpacity={0.8}>
        <Animated.View entering={FadeInRight.delay(delay).springify()} style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Fijo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>Panel de Control</Text>
            <Text style={styles.headerTitle}>Comedor ITSMIGRA</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Resumen Rápido en Header */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{estadisticas.activosHoy}</Text>
            <Text style={styles.summaryLabel}>Asistencias</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{estadisticas.rolesPendientes}</Text>
            <Text style={styles.summaryLabel}>Roles Pend.</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{estadisticas.porcentajeAsistencia}%</Text>
            <Text style={styles.summaryLabel}>Efectividad</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Estadísticas Detalladas */}
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            number={estadisticas.totalBeneficiarios}
            label="Beneficiarios"
            color="#ff6a1aff"
            delay={100}
          />
          <StatCard
            icon="restaurant"
            number={estadisticas.activosHoy}
            label="Comensales"
            color="#10B981"
            delay={200}
          />
        </View>

        {/* Acciones Principales */}
        <Text style={styles.sectionTitle}>Gestión</Text>
        <View style={styles.actionsList}>
          <ActionButton
            icon="qr-code"
            title="Escanear QR"
            subtitle="Registrar entradas rápidamente"
            href="/admin/qr-scanner"
            color="#ff6a1aff"
            delay={300}
          />
          <ActionButton
            icon="people"
            title="Beneficiarios"
            subtitle="Alta, baja y modificación"
            href="/admin/beneficiarios"
            color="#7C3AED"
            delay={400}
          />
          <ActionButton
            icon="document-text"
            title="Gestión de Documentos"
            subtitle="Roles y PDFs informativos"
            href="/admin/gestion-pdfs"
            color="#DB2777"
            delay={500}
          />
          <ActionButton
            icon="bar-chart"
            title="Reportes"
            subtitle="Estadísticas y descargas"
            href="/admin/reportes"
            color="#F59E0B"
            delay={600}
          />

        </View>

        {/* Asistencias Recientes */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <Text style={styles.recentCount}>{asistenciasHoy.length} hoy</Text>
          </View>

          {asistenciasHoy.length > 0 ? (
            <View style={styles.recentList}>
              {asistenciasHoy.slice(0, 5).map((asistencia, index) => {
                const beneficiario = beneficiarios.find(b => b.id === asistencia.beneficiarioId);
                return (
                  <Animated.View
                    key={asistencia.id}
                    entering={FadeInDown.delay(700 + (index * 100))}
                    style={styles.recentItem}
                  >
                    <View style={[styles.recentIcon, { backgroundColor: asistencia.tipo === 'comida' ? '#E0F2FE' : '#FCE7F3' }]}>
                      <Ionicons
                        name={asistencia.tipo === 'comida' ? 'sunny' : 'moon'}
                        size={18}
                        color={asistencia.tipo === 'comida' ? '#ff6a1aff' : '#DB2777'}
                      />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>{beneficiario?.nombre || 'Desconocido'}</Text>
                      <Text style={styles.recentTime}>{asistencia.hora} • {asistencia.tipo.toUpperCase()}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={40} color="#A8A29E" />
              <Text style={styles.emptyText}>Sin actividad hoy</Text>
            </View>
          )}
        </View>

        {/* Botón Discreto de Desarrollo */}
        <TouchableOpacity style={styles.devTrigger} onPress={handleLimpiarDatos} onLongPress={handleLimpiarDatos}>
          <Text style={styles.devText}>v1.0.0 • Admin Mode</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ff6a1aff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: '80%',
    alignSelf: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsList: {
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  recentSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentCount: {
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  recentList: {
    gap: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  recentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#A8A29E',
    marginTop: 8,
    fontSize: 14,
  },
  devTrigger: {
    alignItems: 'center',
    padding: 20,
  },
  devText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
});