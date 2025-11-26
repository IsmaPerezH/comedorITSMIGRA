// app/(tabs)/roles.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStorage } from '@/hooks/useStorage';

// Definir tipos para TypeScript
interface Rol {
  id: string;
  tipo: 'cocina' | 'aseo';
  fecha: string;
  horario: string;
  estado: 'pendiente' | 'completado' | 'proximo';
  compañeros: string[];
  descripcion: string;
}

export default function RolesScreen() {

  // Datos de ejemplo de roles
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'cocina' | 'aseo'>('todos');
  const { obtenerRolesPorBeneficiario, actualizarEstadoRol } = useStorage();

  const beneficiarioActualId = '1';
  
  const roles = obtenerRolesPorBeneficiario(beneficiarioActualId);

  // Filtrar roles según el filtro activo
  const rolesFiltrados = filtroActivo === 'todos' 
    ? roles 
    : roles.filter(rol => rol.tipo === filtroActivo);

  const getTipoColor = (tipo: string) => {
    return tipo === 'cocina' ? '#FF9800' : '#2196F3';
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'cocina' ? 'restaurant' : 'sparkles';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return '#4CAF50';
      case 'proximo': return '#FF9800';
      case 'pendiente': return '#2196F3';
      default: return '#666';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'proximo': return 'Próximo';
      case 'pendiente': return 'Pendiente';
      default: return estado;
    }
  };

  // Estadísticas
  const estadisticas = {
    total: roles.length,
    completados: roles.filter(r => r.estado === 'completado').length,
    pendientes: roles.filter(r => r.estado === 'pendiente').length,
    proximos: roles.filter(r => r.estado === 'proximo').length,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Roles</Text>
        <Text style={styles.subtitle}>Turnos de cocina y aseo</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="list" size={20} color="#1a237e" />
          <Text style={styles.statNumber}>{estadisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
          <Text style={styles.statNumber}>{estadisticas.completados}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={20} color="#FF9800" />
          <Text style={styles.statNumber}>{estadisticas.pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Filtrar por tipo:</Text>
        <View style={styles.filters}>
          <TouchableOpacity 
            style={[styles.filterButton, filtroActivo === 'todos' && styles.filterActive]}
            onPress={() => setFiltroActivo('todos')}
          >
            <Text style={[styles.filterText, filtroActivo === 'todos' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filtroActivo === 'cocina' && styles.filterActive]}
            onPress={() => setFiltroActivo('cocina')}
          >
            <Ionicons name="restaurant" size={16} color={filtroActivo === 'cocina' ? 'white' : '#FF9800'} />
            <Text style={[styles.filterText, filtroActivo === 'cocina' && styles.filterTextActive]}>
              Cocina
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filtroActivo === 'aseo' && styles.filterActive]}
            onPress={() => setFiltroActivo('aseo')}
          >
            <Ionicons name="sparkles" size={16} color={filtroActivo === 'aseo' ? 'white' : '#2196F3'} />
            <Text style={[styles.filterText, filtroActivo === 'aseo' && styles.filterTextActive]}>
              Aseo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {filtroActivo === 'todos' ? 'Todos mis roles' : 
           filtroActivo === 'cocina' ? 'Roles de cocina' : 'Roles de aseo'}
        </Text>
        
        {rolesFiltrados.map((rol) => (
          <View key={rol.id} style={styles.rolCard}>
            {/* Header del rol */}
            <View style={styles.rolHeader}>
              <View style={styles.tipoContainer}>
                <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(rol.tipo) }]}>
                  <Ionicons name={getTipoIcon(rol.tipo)} size={20} color="white" />
                </View>
                <View>
                  <Text style={styles.tipoText}>
                    {rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}
                  </Text>
                  <Text style={styles.fecha}>
                    {new Date(rol.fecha).toLocaleDateString('es-MX', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </Text>
                </View>
              </View>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(rol.estado) }]}>
                <Text style={styles.estadoText}>{getEstadoText(rol.estado)}</Text>
              </View>
            </View>

            {/* Detalles del rol */}
            <View style={styles.rolDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailText}>{rol.horario}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {rol.compañeros.join(', ')}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="document-text" size={16} color="#666" />
                <Text style={styles.detailText}>{rol.descripcion}</Text>
              </View>
            </View>

            {/* Acciones */}
            {rol.estado === 'proximo' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.recordatorioButton}>
                  <Ionicons name="notifications" size={16} color="#2196F3" />
                  <Text style={styles.recordatorioText}>Recordatorio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detallesButton}>
                  <Text style={styles.detallesText}>Ver detalles</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Información adicional */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#2196F3" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Importante</Text>
          <Text style={styles.infoText}>
            Los roles son asignados automáticamente por el sistema. 
            Si no puedes asistir, notifica con anticipación al administrador.
          </Text>
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
    fontSize: 18,
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
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    color: 'white',
  },
  section: {
    padding: 20,
  },
  rolCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  tipoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  fecha: {
    fontSize: 14,
    color: '#666',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rolDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  recordatorioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  recordatorioText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  detallesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  detallesText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 18,
  },
});