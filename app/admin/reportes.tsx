import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AdminReportesScreen() {
  const router = useRouter();
  const { beneficiarios, asistencias, permisos } = useStorage();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
    }
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toISOString().split('T')[0];
  };

  const fechaStr = formatearFecha(fechaSeleccionada);

  // Obtener datos filtrados
  const obtenerEstadoAsistencia = (beneficiarioId: string) => {
    const asistenciasDia = asistencias.filter(
      a => a.beneficiarioId === beneficiarioId && a.fecha === fechaStr
    );

    const permisoDia = permisos.find(
      p => p.beneficiarioId === beneficiarioId && p.fecha === fechaStr && p.estado === 'aprobado'
    );

    return {
      almuerzo: asistenciasDia.some(a => a.tipo === 'almuerzo'),
      comida: asistenciasDia.some(a => a.tipo === 'comida'),
      cena: asistenciasDia.some(a => a.tipo === 'cena'),
      permiso: !!permisoDia,
      motivoPermiso: permisoDia?.motivo
    };
  };

  const datosReporte = beneficiarios.map(beneficiario => ({
    ...beneficiario,
    estado: obtenerEstadoAsistencia(beneficiario.id)
  }));

  // Estadísticas del día
  const estadisticas = {
    totalBeneficiarios: beneficiarios.length,
    asistenciasAlmuerzo: datosReporte.filter(d => d.estado.almuerzo).length,
    asistenciasComida: datosReporte.filter(d => d.estado.comida).length,
    asistenciasCena: datosReporte.filter(d => d.estado.cena).length,
    permisos: datosReporte.filter(d => d.estado.permiso).length
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Moderno (Consistente con Beneficiarios) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reporte Diario</Text>
            <Text style={styles.headerSubtitle}>Control de Asistencias</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Selector de Fecha Visual */}
        <View style={styles.dateDisplayContainer}>
          <Text style={styles.dateDisplayText}>
            {fechaSeleccionada.toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Resumen Estadístico */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{estadisticas.totalBeneficiarios}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FDE68A' }]}>
              <Ionicons name="sunny" size={24} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{estadisticas.asistenciasAlmuerzo}</Text>
            <Text style={[styles.statLabel, { color: '#D97706' }]}>Almuerzo</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FBCFE8' }]}>
              <Ionicons name="restaurant" size={24} color="#DB2777" />
            </View>
            <Text style={[styles.statValue, { color: '#DB2777' }]}>{estadisticas.asistenciasComida}</Text>
            <Text style={[styles.statLabel, { color: '#DB2777' }]}>Comida</Text>
          </Animated.View>
        </View>

        {/* Lista de Beneficiarios */}
        <View style={styles.listContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2, textAlign: 'left', paddingLeft: 16 }]}>Beneficiario</Text>
            <Text style={styles.columnHeader}>Alm.</Text>
            <Text style={styles.columnHeader}>Com.</Text>
            <Text style={styles.columnHeader}>Cena</Text>
            <Text style={styles.columnHeader}>Perm.</Text>
          </View>

          {datosReporte.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 50).springify()}
              style={styles.tableRow}
            >
              <View style={[styles.cell, { flex: 2, alignItems: 'flex-start', paddingLeft: 16 }]}>
                <Text style={styles.nameText} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.matriculaText}>{item.matricula}</Text>
              </View>

              <View style={styles.cell}>
                {item.estado.almuerzo ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark" size={14} color="#059669" />
                  </View>
                ) : (
                  <View style={styles.dash} />
                )}
              </View>

              <View style={styles.cell}>
                {item.estado.comida ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#FCE7F3' }]}>
                    <Ionicons name="checkmark" size={14} color="#DB2777" />
                  </View>
                ) : (
                  <View style={styles.dash} />
                )}
              </View>

              <View style={styles.cell}>
                {item.estado.cena ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#E0E7FF' }]}>
                    <Ionicons name="checkmark" size={14} color="#4F46E5" />
                  </View>
                ) : (
                  <View style={styles.dash} />
                )}
              </View>

              <View style={styles.cell}>
                {item.estado.permiso ? (
                  <TouchableOpacity onPress={() => alert(`Motivo: ${item.estado.motivoPermiso}`)}>
                    <View style={[styles.checkCircle, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="document-text" size={14} color="#D97706" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.dash} />
                )}
              </View>
            </Animated.View>
          ))}
        </View>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplayContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
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
    marginBottom: 24,
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
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  matriculaText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dash: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
  },
});