// app/admin/reportes.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ReportesScreen() {
  const router = useRouter();
  const { asistencias, beneficiarios } = useStorage();

  const estadisticas = {
    totalAsistencias: asistencias.length,
    asistenciasHoy: asistencias.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
    totalBeneficiarios: beneficiarios.length,
    promedioDiario: asistencias.length > 0 ? Math.round(asistencias.length / 30) : 0,
  };

  const MetricCard = ({ icon, number, label, color, delay }: any) => (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.metricCard}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.metricNumber}>{number}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reportes</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>Métricas Clave</Text>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="bar-chart"
            number={estadisticas.totalAsistencias}
            label="Total Asistencias"
            color="#2563EB"
            delay={100}
          />
          <MetricCard
            icon="today"
            number={estadisticas.asistenciasHoy}
            label="Asistencias Hoy"
            color="#10B981"
            delay={200}
          />
          <MetricCard
            icon="people"
            number={estadisticas.totalBeneficiarios}
            label="Beneficiarios"
            color="#F59E0B"
            delay={300}
          />
          <MetricCard
            icon="trending-up"
            number={estadisticas.promedioDiario}
            label="Promedio Diario"
            color="#8B5CF6"
            delay={400}
          />
        </View>

        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={styles.devCard}
        >
          <View style={styles.devHeader}>
            <Ionicons name="construct" size={24} color="#4B5563" />
            <Text style={styles.devTitle}>Próximamente</Text>
          </View>
          <Text style={styles.devDescription}>
            Estamos trabajando en nuevas herramientas de análisis para ti.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.featureText}>Gráficos mensuales</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.featureText}>Exportación a Excel</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.featureText}>Reportes individuales</Text>
            </View>
          </View>
        </Animated.View>
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
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  devCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  devTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  devDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
});