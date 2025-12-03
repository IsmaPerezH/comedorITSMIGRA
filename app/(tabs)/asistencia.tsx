// app/(tabs)/asistencia.tsx
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Asistencia {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'comida' | 'cena';
  comedor: string;
}

type FiltroTipo = 'todos' | 'comida' | 'cena';

export default function AsistenciaScreen() {
  const { user } = useAuth();
  const { obtenerAsistenciasPorBeneficiario, obtenerEstadisticasCompletas } = useStorage();

  const beneficiarioActualId = user?.role === 'student' ? user.uid : '';
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');

  const todasAsistencias = beneficiarioActualId ? obtenerAsistenciasPorBeneficiario(beneficiarioActualId) : [];
  const estadisticas = beneficiarioActualId ? obtenerEstadisticasCompletas(beneficiarioActualId) : {
    totalAsistencias: 0,
    asistenciasComida: 0,
    asistenciasCena: 0,
    rachaActual: 0,
    ultimaAsistencia: null
  };

  // Filtrar asistencias según el filtro activo
  const asistenciasFiltradas = todasAsistencias.filter(asistencia => {
    if (filtroActivo === 'todos') return true;
    return asistencia.tipo === filtroActivo;
  });

  const getTipoIcon = (tipo: string) => {
    return tipo === 'comida' ? 'sunny' : 'moon';
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'comida' ? '#F59E0B' : '#8B5CF6';
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Adapter for statistics display
  const statsDisplay = {
    total: estadisticas.totalAsistencias,
    registradas: estadisticas.totalAsistencias, // Assuming registered means total for now
    porcentaje: 100 // Placeholder
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Mi Asistencia</Text>
              <Text style={styles.headerSubtitle}>Historial y estadísticas</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="calendar-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{statsDisplay.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-done" size={24} color="#059669" />
            </View>
            <Text style={[styles.statValue, { color: '#059669' }]}>{statsDisplay.registradas}</Text>
            <Text style={[styles.statLabel, { color: '#059669' }]}>Registradas</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FDE68A' }]}>
              <Ionicons name="trending-up" size={24} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{statsDisplay.porcentaje}%</Text>
            <Text style={[styles.statLabel, { color: '#D97706' }]}>Asistencia</Text>
          </Animated.View>
        </View>

        {/* Filtros */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.filtersCard}>
          <View style={styles.filtersHeader}>
            <Ionicons name="filter-outline" size={20} color="#2563EB" />
            <Text style={styles.filtersTitle}>Filtrar por tipo</Text>
          </View>
          <View style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, filtroActivo === 'todos' && styles.filterActive]}
              onPress={() => setFiltroActivo('todos')}
            >
              <Ionicons
                name="apps"
                size={16}
                color={filtroActivo === 'todos' ? 'white' : '#6B7280'}
              />
              <Text style={[styles.filterText, filtroActivo === 'todos' && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, filtroActivo === 'comida' && styles.filterActive]}
              onPress={() => setFiltroActivo('comida')}
            >
              <Ionicons
                name="sunny"
                size={16}
                color={filtroActivo === 'comida' ? 'white' : '#6B7280'}
              />
              <Text style={[styles.filterText, filtroActivo === 'comida' && styles.filterTextActive]}>
                Comida
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, filtroActivo === 'cena' && styles.filterActive]}
              onPress={() => setFiltroActivo('cena')}
            >
              <Ionicons
                name="moon"
                size={16}
                color={filtroActivo === 'cena' ? 'white' : '#6B7280'}
              />
              <Text style={[styles.filterText, filtroActivo === 'cena' && styles.filterTextActive]}>
                Cena
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Lista de Asistencias */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Historial de Asistencias</Text>
          <Text style={styles.listCount}>{asistenciasFiltradas.length} registros</Text>
        </View>

        {asistenciasFiltradas.length > 0 ? (
          <View style={styles.listContainer}>
            {asistenciasFiltradas.map((asistencia, index) => (
              <Animated.View
                key={asistencia.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.asistenciaCard}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(asistencia.tipo) + '20' }]}>
                    <Ionicons
                      name={getTipoIcon(asistencia.tipo)}
                      size={24}
                      color={getTipoColor(asistencia.tipo)}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardFecha}>{formatearFecha(asistencia.fecha)}</Text>
                    <Text style={styles.cardHora}>{asistencia.hora}</Text>
                  </View>
                  <View style={styles.estadoBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.estadoText}>Registrada</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="restaurant-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {asistencia.tipo.charAt(0).toUpperCase() + asistencia.tipo.slice(1)}
                    </Text>
                    <View style={[styles.tipoDot, { backgroundColor: getTipoColor(asistencia.tipo) }]} />
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{asistencia.comedor}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No hay registros</Text>
            <Text style={styles.emptySubtitle}>
              {filtroActivo === 'todos'
                ? 'Aún no tienes asistencias registradas'
                : `No tienes asistencias de ${filtroActivo} registradas`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  filtersCard: {
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
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    gap: 12,
  },
  asistenciaCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tipoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardFecha: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardHora: {
    fontSize: 13,
    color: '#6B7280',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    gap: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  tipoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    gap: 12,
    marginTop: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});