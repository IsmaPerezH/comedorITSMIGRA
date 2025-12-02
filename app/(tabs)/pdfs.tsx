// app/(tabs)/pdfs.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
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

      {/* Header Estilo Admin */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Documentos</Text>
            <Text style={styles.headerSubtitle}>Roles y normativas</Text>
          </View>
          <View style={{ width: 40 }} />
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
            <Ionicons name="filter-outline" size={20} color="#ff6a1aff" />
            <Text style={styles.filtersTitle}>Filtrar por tipo</Text>
          </View>
          <View style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, tipoFiltro === 'todos' && styles.filterActive]}
              onPress={() => setTipoFiltro('todos')}
            >
              <Text style={[styles.filterText, tipoFiltro === 'todos' && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, tipoFiltro === 'cocina' && styles.filterActive]}
              onPress={() => setTipoFiltro('cocina')}
            >
              <Text style={[styles.filterText, tipoFiltro === 'cocina' && styles.filterTextActive]}>
                Cocina
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, tipoFiltro === 'aseo' && styles.filterActive]}
              onPress={() => setTipoFiltro('aseo')}
            >
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
                      size={28}
                      color={pdf.tipo === 'cocina' ? '#F59E0B' : '#3B82F6'}
                    />
                  </View>

                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfTitulo}>{pdf.titulo}</Text>
                    <Text style={styles.pdfDescripcion} numberOfLines={2}>
                      {pdf.descripcion}
                    </Text>

                    <View style={styles.pdfMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{formatearFecha(pdf.fecha)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="document-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{formatearTamaño(pdf.tamaño)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.pdfActions}>
                  <TouchableOpacity
                    style={styles.accionButton}
                    onPress={() => abrirPDF(pdf)}
                  >
                    <Text style={[styles.accionText, { color: '#ff6a1aff' }]}>Ver PDF</Text>
                    <Ionicons name="eye-outline" size={18} color="#ff6a1aff" />
                  </TouchableOpacity>

                  <View style={styles.verticalDivider} />

                  <TouchableOpacity
                    style={styles.accionButton}
                    onPress={() => descargarPDF(pdf)}
                  >
                    <Text style={[styles.accionText, { color: '#059669' }]}>Descargar</Text>
                    <Ionicons name="download-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text" size={40} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              No hay documentos
            </Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron documentos con el filtro seleccionado.
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
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  filtersCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  filterActive: {
    backgroundColor: '#ff6a1aff',
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
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  pdfsList: {
    gap: 16,
  },
  pdfCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  pdfHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  pdfIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  pdfTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  pdfDescripcion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  pdfMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  pdfActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  accionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },
  accionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
});