// app/admin/beneficiarios.tsx
import { Beneficiario, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

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
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
    setShowPassword(false);
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

  const activosCount = beneficiarios.filter(b => b.activo).length;
  const inactivosCount = beneficiarios.filter(b => !b.activo).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Beneficiarios</Text>
            <Text style={styles.headerSubtitle}>{beneficiarios.length} registrados</Text>
          </View>
          <TouchableOpacity onPress={handleNuevoBeneficiario} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda */}
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{beneficiarios.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            </View>
            <Text style={[styles.statValue, { color: '#059669' }]}>{activosCount}</Text>
            <Text style={[styles.statLabel, { color: '#059669' }]}>Activos</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </View>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{inactivosCount}</Text>
            <Text style={[styles.statLabel, { color: '#DC2626' }]}>Inactivos</Text>
          </Animated.View>
        </View>

        {/* Lista de Beneficiarios */}
        {beneficiariosFiltrados.length > 0 ? (
          <View style={styles.listContainer}>
            {beneficiariosFiltrados.map((beneficiario, index) => (
              <Animated.View
                key={beneficiario.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.avatarContainer, { backgroundColor: beneficiario.activo ? '#EFF6FF' : '#F3F4F6' }]}>
                    <Text style={[styles.avatarText, { color: beneficiario.activo ? '#2563EB' : '#9CA3AF' }]}>
                      {beneficiario.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{beneficiario.nombre}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="card-outline" size={14} color="#6B7280" />
                      <Text style={styles.cardMatricula}>{beneficiario.matricula}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: beneficiario.activo ? '#ECFDF5' : '#FEF2F2' }]}>
                    <View style={[styles.statusDot, { backgroundColor: beneficiario.activo ? '#10B981' : '#EF4444' }]} />
                    <Text style={[styles.statusText, { color: beneficiario.activo ? '#059669' : '#DC2626' }]}>
                      {beneficiario.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleEditarBeneficiario(beneficiario)}
                  >
                    <Ionicons name="create-outline" size={20} color="#2563EB" />
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleEliminar(beneficiario)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    <Text style={[styles.actionText, { color: '#DC2626' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInUp} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No se encontraron resultados' : 'No hay beneficiarios'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Intenta con otra búsqueda'
                : 'Agrega tu primer beneficiario para comenzar'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.emptyButton} onPress={handleNuevoBeneficiario}>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Agregar Beneficiario</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Modal Mejorado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIcon}>
                  <Ionicons
                    name={editingBeneficiario ? "create-outline" : "person-add-outline"}
                    size={24}
                    color="#2563EB"
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {editingBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="person-outline" size={14} color="#374151" /> Nombre Completo
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Juan Pérez García"
                    placeholderTextColor="#9CA3AF"
                    value={formData.nombre}
                    onChangeText={(t) => setFormData({ ...formData, nombre: t })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="card-outline" size={14} color="#374151" /> Matrícula
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="keypad" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 22105081"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={8}
                    value={formData.matricula}
                    onChangeText={(t) => setFormData({ ...formData, matricula: t })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="lock-closed-outline" size={14} color="#374151" /> Contraseña
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={editingBeneficiario ? "Dejar vacío para mantener" : "Crear contraseña"}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(t) => setFormData({ ...formData, password: t })}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  {editingBeneficiario
                    ? 'Dejar vacío para mantener la contraseña actual'
                    : 'Requerido para el primer acceso del beneficiario'}
                </Text>
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Ionicons
                    name={formData.activo ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={formData.activo ? "#059669" : "#DC2626"}
                  />
                  <Text style={styles.label}>Estado del Beneficiario</Text>
                </View>
                <Switch
                  value={formData.activo}
                  onValueChange={(v) => setFormData({ ...formData, activo: v })}
                  trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                  thumbColor={formData.activo ? '#2563EB' : '#F3F4F6'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar}>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMatricula: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});