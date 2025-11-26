// app/admin/gestion-pdfs.tsx
import { PDFDocument, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function GestionPDFsScreen() {
  const router = useRouter();
  const { pdfs, agregarPDF, eliminarPDF } = useStorage();
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'cocina' | 'aseo'>('todos');

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'cocina' as 'cocina' | 'aseo',
    descripcion: ''
  });

  // Filtrar PDFs
  const pdfsFiltrados = pdfs.filter(pdf => {
    if (tipoFiltro === 'todos') return true;
    return pdf.tipo === tipoFiltro;
  });

  const pdfsCocina = pdfs.filter(p => p.tipo === 'cocina');
  const pdfsAseo = pdfs.filter(p => p.tipo === 'aseo');

  // Seleccionar archivo PDF
  const seleccionarPDF = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) return;

      const archivo = resultado.assets[0];
      const size = archivo.size ?? 0;

      // Simular subida de archivo (en una app real subirías a un servidor)
      Alert.alert(
        'PDF Seleccionado',
        `Archivo: ${archivo.name}\nTamaño: ${(size / 1024 / 1024).toFixed(2)} MB\n\n¿Agregar este PDF?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Agregar',
            onPress: () => {
              setFormData({
                ...formData,
                titulo: archivo.name.replace('.pdf', ''),
                descripcion: `PDF subido el ${new Date().toLocaleDateString()}`
              });
              setModalVisible(true);
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
      console.error('Error seleccionando PDF:', error);
    }
  };

  // Guardar PDF en el sistema
  const guardarPDF = async () => {
    if (!formData.titulo.trim()) {
      Alert.alert('Error', 'Ingresa un título para el PDF');
      return;
    }

    try {
      // En una app real, aquí subirías el archivo y obtendrías la URL real
      const urlSimulada = `https://chaakaskua.edu.mx/pdf/${Date.now()}.pdf`;

      await agregarPDF({
        titulo: formData.titulo,
        tipo: formData.tipo,
        fecha: new Date().toISOString().split('T')[0],
        url: urlSimulada,
        descripcion: formData.descripcion || `PDF de ${formData.tipo}`,
        tamaño: 1024 * 1024, // Tamaño simulado
      });

      Alert.alert('Éxito', 'PDF agregado correctamente');
      setModalVisible(false);
      setFormData({ titulo: '', tipo: 'cocina', descripcion: '' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el PDF');
      console.error('Error guardando PDF:', error);
    }
  };

  // Eliminar PDF
  const handleEliminarPDF = (pdf: PDFDocument) => {
    Alert.alert(
      'Eliminar PDF',
      `¿Estás seguro de eliminar "${pdf.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPDF(pdf.id);
              Alert.alert('Éxito', 'PDF eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el PDF');
            }
          }
        },
      ]
    );
  };

  // Formatear tamaño
  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de PDFs</Text>
        <TouchableOpacity onPress={seleccionarPDF} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="restaurant" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{pdfsCocina.length}</Text>
            <Text style={styles.statLabel}>PDFs Cocina</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{pdfsAseo.length}</Text>
            <Text style={styles.statLabel}>PDFs Aseo</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{pdfs.length}</Text>
            <Text style={styles.statLabel}>Total PDFs</Text>
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
            {tipoFiltro === 'todos' ? 'Todos los PDFs' :
              tipoFiltro === 'cocina' ? 'PDFs de Cocina' : 'PDFs de Aseo'}
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
                      <Text style={styles.pdfFecha}>
                        {new Date(pdf.fecha).toLocaleDateString('es-MX')}
                      </Text>
                    </View>
                    <Text style={styles.pdfDescripcion}>{pdf.descripcion}</Text>
                    <Text style={styles.pdfTamaño}>{formatearTamaño(pdf.tamaño)}</Text>
                  </View>

                  <View style={styles.pdfActions}>
                    <TouchableOpacity style={styles.descargarButton}>
                      <Ionicons name="download" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.eliminarButton}
                      onPress={() => handleEliminarPDF(pdf)}
                    >
                      <Ionicons name="trash" size={20} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {tipoFiltro === 'todos' ? 'No hay PDFs cargados' : `No hay PDFs de ${tipoFiltro}`}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Usa el botón &quot;+&quot; para agregar el primer PDF
              </Text>
            </View>
          )}
        </View>

        {/* Información */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Instrucciones:</Text>
          <View style={styles.instruccionItem}>
            <Ionicons name="add-circle" size={16} color="#666" />
            <Text style={styles.instruccionText}>Agrega PDFs con los roles de cocina y aseo</Text>
          </View>
          <View style={styles.instruccionItem}>
            <Ionicons name="folder-open" size={16} color="#666" />
            <Text style={styles.instruccionText}>Los beneficiarios podrán ver y descargar los PDFs</Text>
          </View>
          <View style={styles.instruccionItem}>
            <Ionicons name="notifications" size={16} color="#666" />
            <Text style={styles.instruccionText}>Pueden configurar recordatorios para sus turnos</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal para agregar PDF */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nuevo PDF</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título del PDF *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Rool de Cocina Noviembre 2025"
                  value={formData.titulo}
                  onChangeText={(text) => setFormData({ ...formData, titulo: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.tipoOptions}>
                  <TouchableOpacity
                    style={[
                      styles.tipoOption,
                      formData.tipo === 'cocina' && styles.tipoOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, tipo: 'cocina' })}
                  >
                    <Ionicons
                      name="restaurant"
                      size={20}
                      color={formData.tipo === 'cocina' ? 'white' : '#FF9800'}
                    />
                    <Text style={[
                      styles.tipoOptionText,
                      formData.tipo === 'cocina' && styles.tipoOptionTextActive
                    ]}>
                      Cocina
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tipoOption,
                      formData.tipo === 'aseo' && styles.tipoOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, tipo: 'aseo' })}
                  >
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={formData.tipo === 'aseo' ? 'white' : '#2196F3'}
                    />
                    <Text style={[
                      styles.tipoOptionText,
                      formData.tipo === 'aseo' && styles.tipoOptionTextActive
                    ]}>
                      Aseo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción opcional del PDF..."
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={guardarPDF}
                  style={[
                    styles.saveButton,
                    !formData.titulo.trim() && styles.saveButtonDisabled
                  ]}
                  disabled={!formData.titulo.trim()}
                >
                  <Text style={styles.saveButtonText}>Guardar PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtersContainer: {
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
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterActive: {
    backgroundColor: '#1a237e',
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
    marginBottom: 24,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pdfDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tipoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pdfFecha: {
    fontSize: 12,
    color: '#666',
  },
  pdfDescripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pdfTamaño: {
    fontSize: 10,
    color: '#999',
  },
  pdfActions: {
    gap: 8,
  },
  descargarButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  eliminarButton: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tipoOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  tipoOptionActive: {
    borderColor: 'transparent',
    backgroundColor: '#2196F3',
  },
  tipoOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tipoOptionTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});