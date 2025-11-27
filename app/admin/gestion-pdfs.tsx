// app/admin/gestion-pdfs.tsx
import { PDFDocument, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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

  const pdfsFiltrados = pdfs.filter(pdf => {
    if (tipoFiltro === 'todos') return true;
    return pdf.tipo === tipoFiltro;
  });

  const seleccionarPDF = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) return;

      const archivo = resultado.assets[0];
      const size = archivo.size ?? 0;

      Alert.alert(
        'Confirmar Archivo',
        `¿Deseas agregar "${archivo.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              setFormData({
                ...formData,
                titulo: archivo.name.replace('.pdf', ''),
                descripcion: `Subido el ${new Date().toLocaleDateString()}`
              });
              setModalVisible(true);
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const guardarPDF = async () => {
    if (!formData.titulo.trim()) {
      Alert.alert('Título requerido', 'Por favor asigna un nombre al documento.');
      return;
    }

    try {
      const urlSimulada = `https://chaakaskua.edu.mx/pdf/${Date.now()}.pdf`;
      await agregarPDF({
        titulo: formData.titulo,
        tipo: formData.tipo,
        fecha: new Date().toISOString().split('T')[0],
        url: urlSimulada,
        descripcion: formData.descripcion || `Documento de ${formData.tipo}`,
        tamaño: 1024 * 1024,
      });

      setModalVisible(false);
      setFormData({ titulo: '', tipo: 'cocina', descripcion: '' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el documento.');
    }
  };

  const handleEliminarPDF = (pdf: PDFDocument) => {
    Alert.alert(
      'Eliminar Documento',
      `¿Estás seguro de eliminar "${pdf.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarPDF(pdf.id)
        },
      ]
    );
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documentos</Text>
          <TouchableOpacity onPress={seleccionarPDF} style={styles.addButton}>
            <Ionicons name="cloud-upload" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filtros Segmentados */}
        <View style={styles.filterSegment}>
          {(['todos', 'cocina', 'aseo'] as const).map((filtro) => (
            <TouchableOpacity
              key={filtro}
              style={[
                styles.filterBtn,
                tipoFiltro === filtro && styles.filterBtnActive
              ]}
              onPress={() => setTipoFiltro(filtro)}
            >
              <Text style={[
                styles.filterText,
                tipoFiltro === filtro && styles.filterTextActive
              ]}>
                {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {pdfsFiltrados.length > 0 ? (
          <View style={styles.listContainer}>
            {pdfsFiltrados.map((pdf, index) => (
              <Animated.View
                key={pdf.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.card}
              >
                <View style={[
                  styles.cardIcon,
                  { backgroundColor: pdf.tipo === 'cocina' ? '#FFF7ED' : '#EFF6FF' }
                ]}>
                  <Ionicons
                    name={pdf.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                    size={24}
                    color={pdf.tipo === 'cocina' ? '#EA580C' : '#2563EB'}
                  />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{pdf.titulo}</Text>
                  <Text style={styles.cardMeta}>
                    {new Date(pdf.fecha).toLocaleDateString()} • {formatearTamaño(pdf.tamaño)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleEliminarPDF(pdf)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No hay documentos</Text>
            <Text style={styles.emptySubtitle}>Sube un PDF para comenzar</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Moderno */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Documento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Rol de Cocina Noviembre"
                  value={formData.titulo}
                  onChangeText={(t) => setFormData({ ...formData, titulo: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoryRow}>
                  <TouchableOpacity
                    style={[
                      styles.categoryBtn,
                      formData.tipo === 'cocina' && styles.categoryBtnActive
                    ]}
                    onPress={() => setFormData({ ...formData, tipo: 'cocina' })}
                  >
                    <Ionicons
                      name="restaurant"
                      size={20}
                      color={formData.tipo === 'cocina' ? 'white' : '#6B7280'}
                    />
                    <Text style={[
                      styles.categoryText,
                      formData.tipo === 'cocina' && styles.categoryTextActive
                    ]}>Cocina</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryBtn,
                      formData.tipo === 'aseo' && styles.categoryBtnActive
                    ]}
                    onPress={() => setFormData({ ...formData, tipo: 'aseo' })}
                  >
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={formData.tipo === 'aseo' ? 'white' : '#6B7280'}
                    />
                    <Text style={[
                      styles.categoryText,
                      formData.tipo === 'aseo' && styles.categoryTextActive
                    ]}>Aseo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detalles adicionales..."
                  multiline
                  numberOfLines={3}
                  value={formData.descripcion}
                  onChangeText={(t) => setFormData({ ...formData, descripcion: t })}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={guardarPDF}>
                <Text style={styles.saveBtnText}>Guardar Documento</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    marginBottom: 20,
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
  addButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  filterSegment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  categoryBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: 'white',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});