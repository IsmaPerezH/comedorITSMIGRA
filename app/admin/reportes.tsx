import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { printToFileAsync } from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
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
  const [loadingPdf, setLoadingPdf] = useState(false);

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

  const generarPDF = async () => {
    setLoadingPdf(true);
    try {
      const fechaFormateada = fechaSeleccionada.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { color: #1F2937; text-align: center; margin-bottom: 10px; }
              p.date { text-align: center; color: #6B7280; margin-bottom: 30px; font-size: 14px; }
              .stats { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .stat-box { background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; width: 22%; }
              .stat-value { font-size: 20px; font-weight: bold; color: #1F2937; }
              .stat-label { font-size: 12px; color: #6B7280; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { background: #E5E7EB; padding: 10px; text-align: left; color: #374151; }
              td { border-bottom: 1px solid #E5E7EB; padding: 10px; color: #1F2937; }
              .check { color: #059669; font-weight: bold; }
              .dash { color: #D1D5DB; }
              .permiso { color: #D97706; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>Reporte de Asistencias</h1>
            <p class="date">${fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}</p>

            <div class="stats">
              <div class="stat-box">
                <div class="stat-value">${estadisticas.totalBeneficiarios}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: #D97706">${estadisticas.asistenciasAlmuerzo}</div>
                <div class="stat-label">Almuerzo</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: #DB2777">${estadisticas.asistenciasComida}</div>
                <div class="stat-label">Comida</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: #4F46E5">${estadisticas.asistenciasCena}</div>
                <div class="stat-label">Cena</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Beneficiario</th>
                  <th>Matrícula</th>
                  <th style="text-align: center">Almuerzo</th>
                  <th style="text-align: center">Comida</th>
                  <th style="text-align: center">Cena</th>
                  <th style="text-align: center">Permiso</th>
                </tr>
              </thead>
              <tbody>
                ${datosReporte.map(item => `
                  <tr>
                    <td>${item.nombre}</td>
                    <td>${item.matricula}</td>
                    <td style="text-align: center">${item.estado.almuerzo ? '<span class="check">✓</span>' : '<span class="dash">-</span>'}</td>
                    <td style="text-align: center">${item.estado.comida ? '<span class="check">✓</span>' : '<span class="dash">-</span>'}</td>
                    <td style="text-align: center">${item.estado.cena ? '<span class="check">✓</span>' : '<span class="dash">-</span>'}</td>
                    <td style="text-align: center">${item.estado.permiso ? '<span class="permiso">Sí</span>' : '<span class="dash">-</span>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html: htmlContent });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el reporte PDF');
      console.error(error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno (Consistente con Beneficiarios) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reporte Diario</Text>
            <Text style={styles.headerSubtitle}>Control de Asistencias</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={generarPDF}
              disabled={loadingPdf}
            >
              <Ionicons name="document-text" size={20} color="white" />
            </TouchableOpacity>
          </View>
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
            <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="people" size={24} color="#ff6a1aff" />
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
    backgroundColor: '#FFF7ED',
  },
  header: {
    backgroundColor: '#ff6a1aff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplayContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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