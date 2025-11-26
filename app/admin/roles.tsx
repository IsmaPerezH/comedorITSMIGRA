// app/admin/roles.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RolesScreen() {
  const router = useRouter();
  const { roles, beneficiarios } = useStorage();

  // Agrupar roles por fecha
  const rolesAgrupados = roles.reduce((acc, rol) => {
    if (!acc[rol.fecha]) {
      acc[rol.fecha] = [];
    }
    acc[rol.fecha].push(rol);
    return acc;
  }, {} as { [key: string]: any[] });

  const getBeneficiarioNombre = (beneficiarioId: string) => {
    const beneficiario = beneficiarios.find(b => b.id === beneficiarioId);
    return beneficiario?.nombre || 'Desconocido';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Roles</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Total de Roles: {roles.length}
        </Text>

        {/* Resumen de estados */}
        <View style={styles.estadosGrid}>
          <View style={styles.estadoCard}>
            <Text style={[styles.estadoNumber, { color: '#FF9800' }]}>
              {roles.filter(r => r.estado === 'proximo').length}
            </Text>
            <Text style={styles.estadoLabel}>Próximos</Text>
          </View>
          <View style={styles.estadoCard}>
            <Text style={[styles.estadoNumber, { color: '#2196F3' }]}>
              {roles.filter(r => r.estado === 'pendiente').length}
            </Text>
            <Text style={styles.estadoLabel}>Pendientes</Text>
          </View>
          <View style={styles.estadoCard}>
            <Text style={[styles.estadoNumber, { color: '#4CAF50' }]}>
              {roles.filter(r => r.estado === 'completado').length}
            </Text>
            <Text style={styles.estadoLabel}>Completados</Text>
          </View>
        </View>

        {/* Lista de roles por fecha */}
        {Object.entries(rolesAgrupados).map(([fecha, rolesFecha]) => (
          <View key={fecha} style={styles.fechaSection}>
            <Text style={styles.fechaTitle}>
              {new Date(fecha).toLocaleDateString('es-MX', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            {rolesFecha.map((rol) => (
              <View key={rol.id} style={styles.rolCard}>
                <View style={styles.rolHeader}>
                  <View style={[
                    styles.tipoBadge,
                    { backgroundColor: rol.tipo === 'cocina' ? '#FF9800' : '#2196F3' }
                  ]}>
                    <Ionicons 
                      name={rol.tipo === 'cocina' ? 'restaurant' : 'sparkles'} 
                      size={16} 
                      color="white" 
                    />
                    <Text style={styles.tipoText}>
                      {rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { 
                      backgroundColor: 
                        rol.estado === 'completado' ? '#4CAF50' :
                        rol.estado === 'proximo' ? '#FF9800' : '#2196F3'
                    }
                  ]}>
                    <Text style={styles.estadoText}>
                      {rol.estado.charAt(0).toUpperCase() + rol.estado.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.beneficiarioName}>
                  {getBeneficiarioNombre(rol.beneficiarioId)}
                </Text>
                <Text style={styles.horario}>{rol.horario}</Text>
                <Text style={styles.descripcion}>{rol.descripcion}</Text>
                {rol.compañeros.length > 0 && (
                  <Text style={styles.compañeros}>
                    Con: {rol.compañeros.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Mensaje de desarrollo */}
        <View style={styles.devMessage}>
          <Ionicons name="calendar" size={32} color="#9C27B0" />
          <Text style={styles.devTitle}>Gestión de Roles en Desarrollo</Text>
          <Text style={styles.devText}>
            Próximamente podrás crear, asignar y gestionar roles de manera 
            automática, con recordatorios y notificaciones.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  estadosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estadoCard: {
    alignItems: 'center',
  },
  estadoNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estadoLabel: {
    fontSize: 12,
    color: '#666',
  },
  fechaSection: {
    marginBottom: 20,
  },
  fechaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rolCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  beneficiarioName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  horario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  compañeros: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  devMessage: {
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  devTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginTop: 12,
    marginBottom: 8,
  },
  devText: {
    fontSize: 14,
    color: '#7b1fa2',
    textAlign: 'center',
    lineHeight: 20,
  },
});