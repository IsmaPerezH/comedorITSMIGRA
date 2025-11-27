// app/(tabs)/pdfs.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PDFsScreen() {
  const { obtenerPDFsPorTipo } = useStorage();
  const [tipoFiltro, setTipoFiltro] = useState<'cocina' | 'aseo' | 'todos'>('todos');

  const pdfsCocina = obtenerPDFsPorTipo('cocina');
  const pdfsAseo = obtenerPDFsPorTipo('aseo');

  const pdfsFiltrados = tipoFiltro === 'todos'
    ? [...pdfsCocina, ...pdfsAseo]
    : tipoFiltro === 'cocina' ? pdfsCocina : pdfsAseo;

  const abrirPDF = (pdf: any) => {
    Alert.alert(
      'Abrir PDF',
      `¿Quieres abrir "${pdf.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: () => {
            Alert.alert(
              'PDF Simulado',
              `El PDF "${pdf.titulo}" se abriría en un visor de PDFs.\n\nEn una aplicación real, este PDF estaría disponible para descargar y ver.`
            );
          }
        },
      ]
    );
  };

  const descargarPDF = (pdf: any) => {
    Alert.alert(
      'Descargar PDF',
      `¿Descargar "${pdf.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descargar',
          onPress: () => {
            Alert.alert(
              'Descarga Simulada',
              `El PDF "${pdf.titulo}" se descargaría a tu dispositivo.\n\nTamaño: ${(pdf.tamaño / 1024 / 1024).toFixed(1)} MB`
            );
          }
        },
      ]
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="document-text" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Documentos</Text>
              <Text style={styles.headerSubtitle}>PDFs de roles</Text>
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
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="restaurant" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{pdfsCocina.length}</Text>
            <Text style={styles.statLabel}>Cocina</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="sparkles" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{pdfsAseo.length}</Text>
            <Text style={styles.statLabel}>Aseo</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="document" size={24} color="#059669" />
            </View>
            <Text style={styles.statValue}>{pdfsCocina.length + pdfsAseo.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
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
              style={[styles.filterButton, tipoFiltro === 'todos' && styles.filterActive]}
              onPress={() => setTipoFiltro('todos')}
            >
              <Ionicons
                name="apps"
                size={16}
                color={tipoFiltro === 'todos' ? 'white' : '#6B7280'}
              />
              <Text style={[styles.filterText, tipoFiltro === 'todos' && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, tipoFiltro === 'cocina' && styles.filterActive]}
              onPress={() => setTipoFiltro('cocina')}
            >
              <Ionicons
                name="restaurant"
                size={16}
                color={tipoFiltro === 'cocina' ? 'white' : '#F59E0B'}
              />
              <Text style={[styles.filterText, tipoFiltro === 'cocina' && styles.filterTextActive]}>
                Cocina
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, tipoFiltro === 'aseo' && styles.filterActive]}
              onPress={() => setTipoFiltro('aseo')}
            >
              <Ionicons
                name="sparkles"
                size={16}
                color={tipoFiltro === 'aseo' ? 'white' : '#3B82F6'}
              />
              <Text style={[styles.filterText, tipoFiltro === 'aseo' && styles.filterTextActive]}>
                Aseo
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Lista de PDFs */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {tipoFiltro === 'todos' ? 'Todos los Documentos' :
              tipoFiltro === 'cocina' ? 'Roles de Cocina' : 'Roles de Aseo'}
          </Text>
          <Text style={styles.listCount}>{pdfsFiltrados.length} documentos</Text>
        </View>

        {pdfsFiltrados.length > 0 ? (
          <View style={styles.pdfsList}>
            {pdfsFiltrados.map((pdf, index) => (
              <Animated.View
                key={pdf.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.pdfCard}
              >
                <View style={styles.pdfHeader}>
                  <View style={[
                    styles.pdfIcon,
                    { backgroundColor: pdf.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }
                  ]}>
                    <Ionicons
                      name="document-text"
                      size={32}
                      color={pdf.tipo === 'cocina' ? '#F59E0B' : '#3B82F6'}
                    />
                  </View>

                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfTitulo}>{pdf.titulo}</Text>

                    <View style={styles.pdfDetails}>
                      <View style={[
                        styles.tipoBadge,
                        { backgroundColor: pdf.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }
                      ]}>
                        <Ionicons
                          name={pdf.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                          size={12}
                          color={pdf.tipo === 'cocina' ? '#F59E0B' : '#3B82F6'}
                        />
                        <Text style={[
                          styles.tipoText,
                          { color: pdf.tipo === 'cocina' ? '#F59E0B' : '#3B82F6' }
                        ]}>
                          {pdf.tipo.charAt(0).toUpperCase() + pdf.tipo.slice(1)}
                        </Text>
                      </View>
                      <View style={styles.fechaContainer}>
                        <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                        <Text style={styles.pdfFecha}>{formatearFecha(pdf.fecha)}</Text>
                      </View>
                    </View>

                    <Text style={styles.pdfDescripcion} numberOfLines={2}>
                      {pdf.descripcion}
                    </Text>

                    <View style={styles.pdfMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="document-outline" size={14} color="#6B7280" />
                        <Text style={styles.pdfTamaño}>{formatearTamaño(pdf.tamaño)}</Text>
                      </View>
                      <View style={styles.estadoBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#059669" />
                        <Text style={styles.pdfEstado}>Disponible</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.pdfActions}>
                  <TouchableOpacity
                    style={styles.accionButton}
                    onPress={() => abrirPDF(pdf)}
                  >
                    <View style={[styles.accionIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="eye-outline" size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.accionText}>Ver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.accionButton}
                    onPress={() => descargarPDF(pdf)}
                  >
                    <View style={[styles.accionIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="download-outline" size={20} color="#059669" />
                    </View>
                    <Text style={styles.accionText}>Descargar</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              {tipoFiltro === 'todos' ? 'No hay documentos disponibles' : `No hay documentos de ${tipoFiltro}`}
            </Text>
            <Text style={styles.emptySubtitle}>
              Los administradores cargarán los roles próximamente
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
  pdfsList: {
    gap: 12,
  },
  pdfCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pdfHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pdfIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  pdfDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfFecha: {
    fontSize: 12,
    color: '#6B7280',
  },
  pdfDescripcion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  pdfMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfTamaño: {
    fontSize: 12,
    color: '#6B7280',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfEstado: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  pdfActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  accionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  accionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
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
    marginBottom: 12,
  },
  instruccionesList: {
    gap: 8,
  },
  instruccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instruccionText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  instruccionBold: {
    fontWeight: '600',
  },
});