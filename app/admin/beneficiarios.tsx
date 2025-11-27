// app/admin/beneficiarios.tsx
import { Beneficiario, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function BeneficiariosScreen() {
  const router = useRouter();
  const {
    beneficiarios,
    agregarBeneficiario,
    actualizarBeneficiario,
    eliminarBeneficiario,
    matriculaExiste
  } = useStorage();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    activo: true,
    password: ''
  });

  const beneficiariosFiltrados = beneficiarios.filter(beneficiario =>
    beneficiario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beneficiario.matricula.includes(searchQuery)
  );

  const handleNuevoBeneficiario = () => {
    setEditingBeneficiario(null);
    setFormData({ nombre: '', matricula: '', activo: true, password: '' });
    setModalVisible(true);
  };

  const handleEditarBeneficiario = (beneficiario: Beneficiario) => {
    setEditingBeneficiario(beneficiario);
    setFormData({
      nombre: beneficiario.nombre,
      matricula: beneficiario.matricula,
      activo: beneficiario.activo,
      password: beneficiario.password
    });
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim() || !formData.matricula.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa nombre y matrícula.');
      return;
    }

    if (!editingBeneficiario && !formData.password.trim()) {
      Alert.alert('Contraseña requerida', 'Debes asignar una contraseña inicial.');
      return;
    }

    if (matriculaExiste(formData.matricula, editingBeneficiario?.id)) {
      Alert.alert('Matrícula duplicada', 'Esta matrícula ya está registrada.');
      return;
    }

    try {
      if (editingBeneficiario) {
        await actualizarBeneficiario(editingBeneficiario.id, formData);
      } else {
        await agregarBeneficiario(formData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el beneficiario.');
    }
  };

  const handleEliminar = (beneficiario: Beneficiario) => {
    Alert.alert(
      'Eliminar Beneficiario',
      `¿Eliminar a ${beneficiario.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarBeneficiario(beneficiario.id)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beneficiarios</Text>
          <TouchableOpacity onPress={handleNuevoBeneficiario} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda Integrada */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o matrícula..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Resumen de Estado */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{beneficiarios.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              {beneficiarios.filter(b => b.activo).length}
            </Text>
            <Text style={[styles.statLabel, { color: '#059669' }]}>Activos</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>
              {beneficiarios.filter(b => !b.activo).length}
            </Text>
            <Text style={[styles.statLabel, { color: '#DC2626' }]}>Inactivos</Text>
          </View>
        </View>

        {beneficiariosFiltrados.length > 0 ? (
          <View style={styles.listContainer}>
            {beneficiariosFiltrados.map((beneficiario, index) => (
              <Animated.View
                key={beneficiario.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {beneficiario.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{beneficiario.nombre}</Text>
                    <Text style={styles.cardMatricula}>{beneficiario.matricula}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: beneficiario.activo ? '#10B981' : '#EF4444' }]} />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                    onPress={() => handleEditarBeneficiario(beneficiario)}
                  >
                    <Ionicons name="pencil" size={18} color="#2563EB" />
                    <Text style={[styles.actionText, { color: '#2563EB' }]}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                    onPress={() => handleEliminar(beneficiario)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
            <Text style={styles.emptySubtitle}>Intenta con otra búsqueda o agrega un nuevo beneficiario</Text>
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
              <Text style={styles.modalTitle}>
                {editingBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChangeText={(t) => setFormData({ ...formData, nombre: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Matrícula</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 22105081"
                  keyboardType="numeric"
                  maxLength={8}
                  value={formData.matricula}
                  onChangeText={(t) => setFormData({ ...formData, matricula: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder={editingBeneficiario ? "••••••" : "Crear contraseña"}
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(t) => setFormData({ ...formData, password: t })}
                />
                <Text style={styles.helperText}>
                  {editingBeneficiario ? 'Dejar vacío para mantener la actual' : 'Requerido para el primer acceso'}
                </Text>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Estado Activo</Text>
                <Switch
                  value={formData.activo}
                  onValueChange={(v) => setFormData({ ...formData, activo: v })}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={formData.activo ? '#2563EB' : '#F3F4F6'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar}>
                <Text style={styles.saveBtnText}>Guardar</Text>
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
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardMatricula: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
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
    maxWidth: 250,
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
    maxHeight: '80%',
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
  },
});