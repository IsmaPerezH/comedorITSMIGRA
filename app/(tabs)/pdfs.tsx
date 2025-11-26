// app/(tabs)/pdfs.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PDFsScreen() {
  const { obtenerPDFsPorTipo } = useStorage();
  const [tipoFiltro, setTipoFiltro] = useState<'cocina' | 'aseo' | 'todos'>('todos');

  const pdfsCocina = obtenerPDFsPorTipo('cocina');
  const pdfsAseo = obtenerPDFsPorTipo('aseo');
  
  const pdfsFiltrados = tipoFiltro === 'todos' 
    ? [...pdfsCocina, ...pdfsAseo]
    : tipoFiltro === 'cocina' ? pdfsCocina : pdfsAseo;

  // Abrir PDF (simulado)
  const abrirPDF = (pdf: any) => {
    Alert.alert(
      'Abrir PDF',
      `¿Quieres abrir "${pdf.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir', 
          onPress: () => {
            // En una app real, aquí abrirías el PDF con un visor
            Alert.alert(
              'PDF Simulado',
              `El PDF "${pdf.titulo}" se abriría en un visor de PDFs.\n\nEn una aplicación real, este PDF estaría disponible para descargar y ver.`
            );
          }
        },
      ]
    );
  };

  // Descargar PDF
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

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear tamaño
  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Documentos y Roles</Text>
        <Text style={styles.subtitle}>PDFs de cocina y aseo</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="restaurant" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{pdfsCocina.length}</Text>
          <Text style={styles.statLabel}>Cocina</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="sparkles" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{pdfsAseo.length}</Text>
          <Text style={styles.statLabel}>Aseo</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{pdfsCocina.length + pdfsAseo.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtrar por tipo:</Text>
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
            <Ionicons name="restaurant" size={16} color={tipoFiltro === 'cocina' ? 'white' : '#FF9800'} />
            <Text style={[styles.filterText, tipoFiltro === 'cocina' && styles.filterTextActive]}>
              Cocina
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, tipoFiltro === 'aseo' && styles.filterActive]}
            onPress={() => setTipoFiltro('aseo')}
          >
            <Ionicons name="sparkles" size={16} color={tipoFiltro === 'aseo' ? 'white' : '#2196F3'} />
            <Text style={[styles.filterText, tipoFiltro === 'aseo' && styles.filterTextActive]}>
              Aseo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de PDFs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {tipoFiltro === 'todos' ? 'Todos los Documentos' : 
           tipoFiltro === 'cocina' ? 'Roles de Cocina' : 'Roles de Aseo'}
        </Text>

        {pdfsFiltrados.length > 0 ? (
          <View style={styles.pdfsList}>
            {pdfsFiltrados.map((pdf) => (
              <View key={pdf.id} style={styles.pdfCard}>
                <View style={styles.pdfIcon}>
                  <Ionicons name="document" size={32} color="#f44336" />
                </View>
                
                <View style={styles.pdfInfo}>
                  <Text style={styles.pdfTitulo}>{pdf.titulo}</Text>
                  
                  <View style={styles.pdfDetails}>
                    <View style={[styles.tipoBadge, { 
                      backgroundColor: pdf.tipo === 'cocina' ? '#FF9800' : '#2196F3' 
                    }]}>
                      <Text style={styles.tipoText}>
                        {pdf.tipo.charAt(0).toUpperCase() + pdf.tipo.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.pdfFecha}>{formatearFecha(pdf.fecha)}</Text>
                  </View>

                  <Text style={styles.pdfDescripcion}>{pdf.descripcion}</Text>
                  
                  <View style={styles.pdfMeta}>
                    <Text style={styles.pdfTamaño}>{formatearTamaño(pdf.tamaño)}</Text>
                    <Text style={styles.pdfEstado}>Disponible</Text>
                  </View>
                </View>

                <View style={styles.pdfActions}>
                  <TouchableOpacity 
                    style={styles.accionButton}
                    onPress={() => abrirPDF(pdf)}
                  >
                    <Ionicons name="eye" size={20} color="#2196F3" />
                    <Text style={styles.accionText}>Ver</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.accionButton}
                    onPress={() => descargarPDF(pdf)}
                  >
                    <Ionicons name="download" size={20} color="#4CAF50" />
                    <Text style={styles.accionText}>Descargar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {tipoFiltro === 'todos' ? 'No hay documentos disponibles' : `No hay documentos de ${tipoFiltro}`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Los administradores cargarán los roles próximamente
            </Text>
          </View>
        )}
      </View>

      {/* Información */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>¿Cómo usar los documentos?</Text>
        <View style={styles.instruccionItem}>
          <Ionicons name="eye" size={16} color="#666" />
          <Text style={styles.instruccionText}>
            <Text style={styles.instruccionBold}>Ver:</Text> Revisa los roles asignados
          </Text>
        </View>
        <View style={styles.instruccionItem}>
          <Ionicons name="download" size={16} color="#666" />
          <Text style={styles.instruccionText}>
            <Text style={styles.instruccionBold}>Descargar:</Text> Guarda una copia en tu dispositivo
          </Text>
        </View>
        <View style={styles.instruccionItem}>
          <Ionicons name="notifications" size={16} color="#666" />
          <Text style={styles.instruccionText}>
            <Text style={styles.instruccionBold}>Configura recordatorios</Text> para tus turnos
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
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  pdfsList: {
    gap: 16,
  },
  pdfCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfIcon: {
    marginRight: 12,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pdfDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pdfFecha: {
    fontSize: 12,
    color: '#666',
  },
  pdfDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  pdfMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pdfTamaño: {
    fontSize: 12,
    color: '#999',
  },
  pdfEstado: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  pdfActions: {
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  accionButton: {
    alignItems: 'center',
    padding: 8,
    minWidth: 60,
  },
  accionText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  instruccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instruccionText: {
    fontSize: 14,
    color: '#1976d2',
    flex: 1,
  },
  instruccionBold: {
    fontWeight: '600',
  },
});