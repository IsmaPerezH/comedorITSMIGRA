// app/(tabs)/asistencia.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definir tipos para TypeScript
interface Asistencia {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'comida' | 'cena';
  comedor: string;
}

export default function AsistenciaScreen() {
  
  // ID del beneficiario actual (en una app real esto vendría del login)
  

  const { obtenerAsistenciasPorBeneficiario, obtenerEstadisticasCompletas } = useStorage();

// ID del beneficiario actual
  const beneficiarioActualId = '1';
  const asistencias = obtenerAsistenciasPorBeneficiario(beneficiarioActualId);
  const estadisticas = obtenerEstadisticasCompletas(beneficiarioActualId);

  // Calcular estadísticas correctamente


  const getEstadoColor = (fecha: string) => {
    // En nuestro sistema actual, todas las asistencias están registradas
    return '#4CAF50'; // Siempre verde para "registrada"
  };

  const getEstadoIcon = (): any => {
    return 'checkmark-circle';
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'comida' ? '#2196F3' : '#9C27B0';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Asistencia</Text>
        <Text style={styles.subtitle}>Historial y estadísticas</Text>
      </View>

      {/* Estadísticas Rápidas - CORREGIDAS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#1a237e" />
          <Text style={styles.statNumber}>{estadisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{estadisticas.registradas}</Text>
          <Text style={styles.statLabel}>Registradas</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{estadisticas.porcentaje}%</Text>
          <Text style={styles.statLabel}>Asistencia</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Filtrar por:</Text>
        <View style={styles.filters}>
          <TouchableOpacity style={[styles.filterButton, styles.filterActive]}>
            <Text style={styles.filterTextActive}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Comida</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Cena</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Este mes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Asistencias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Asistencias</Text>
        {asistencias.map((asistencia) => (
          <View key={asistencia.id} style={styles.asistenciaCard}>
            <View style={styles.asistenciaHeader}>
              <View style={styles.fechaContainer}>
                <Text style={styles.fecha}>{new Date(asistencia.fecha).toLocaleDateString('es-MX', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}</Text>
                <Text style={styles.hora}>{asistencia.hora}</Text>
              </View>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(asistencia.fecha) }]}>
                <Ionicons name={getEstadoIcon()} size={16} color="white" />
                <Text style={styles.estadoText}>Registrada</Text>
              </View>
            </View>
            
            <View style={styles.asistenciaDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="fast-food" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {asistencia.tipo.charAt(0).toUpperCase() + asistencia.tipo.slice(1)}
                </Text>
                <View style={[styles.tipoDot, { backgroundColor: getTipoColor(asistencia.tipo) }]} />
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.detailText}>{asistencia.comedor}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Información adicional */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Tu historial se actualiza automáticamente cuando el administrador escanea tu QR.
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
  header: {
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 60,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 12,
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  asistenciaCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  asistenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fechaContainer: {
    flex: 1,
  },
  fecha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hora: {
    fontSize: 14,
    color: '#666',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  asistenciaDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  tipoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 18,
  },
});