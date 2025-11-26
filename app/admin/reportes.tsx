// app/admin/reportes.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReportesScreen() {
  const router = useRouter();
  const { asistencias, beneficiarios } = useStorage();

  // Estadísticas para reportes
  const estadisticas = {
    totalAsistencias: asistencias.length,
    asistenciasHoy: asistencias.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
    totalBeneficiarios: beneficiarios.length,
    promedioDiario: asistencias.length > 0 ? Math.round(asistencias.length / 30) : 0, // Aproximado
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Reportes y Estadísticas</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Métricas principales */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="bar-chart" size={24} color="#2196F3" />
            <Text style={styles.metricNumber}>{estadisticas.totalAsistencias}</Text>
            <Text style={styles.metricLabel}>Total Asistencias</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="today" size={24} color="#4CAF50" />
            <Text style={styles.metricNumber}>{estadisticas.asistenciasHoy}</Text>
            <Text style={styles.metricLabel}>Asistencias Hoy</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="people" size={24} color="#FF9800" />
            <Text style={styles.metricNumber}>{estadisticas.totalBeneficiarios}</Text>
            <Text style={styles.metricLabel}>Beneficiarios</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#9C27B0" />
            <Text style={styles.metricNumber}>{estadisticas.promedioDiario}</Text>
            <Text style={styles.metricLabel}>Promedio Diario</Text>
          </View>
        </View>

        {/* Mensaje de desarrollo */}
        <View style={styles.devMessage}>
          <Ionicons name="analytics" size={32} color="#2196F3" />
          <Text style={styles.devTitle}>Reportes en Desarrollo</Text>
          <Text style={styles.devText}>
            Próximamente tendrás acceso a reportes detallados, gráficos 
            de asistencia, exportación de datos y análisis avanzados.
          </Text>
        </View>

        {/* Funcionalidades próximas */}
        <View style={styles.featuresList}>
          <Text style={styles.featuresTitle}>Próximas Funcionalidades:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Gráficos de asistencia mensual</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Reportes por beneficiario</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Exportación a Excel/PDF</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Análisis de tendencias</Text>
          </View>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  metricCard: {
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
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  devMessage: {
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 20,
  },
  devTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 12,
    marginBottom: 8,
  },
  devText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});