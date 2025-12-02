// app/admin/roles.tsx
import { Rol, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function RolesScreen() {
  const router = useRouter();
  const { roles, beneficiarios, agregarRol, actualizarRol, eliminarRol } = useStorage();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    beneficiarioId: '',
    tipo: 'cocina' as 'cocina' | 'aseo',
    fecha: new Date().toISOString().split('T')[0],
    horario: '08:00 - 12:00',
    estado: 'pendiente' as 'pendiente' | 'completado' | 'proximo',
    descripcion: '',
    compañeros: '' // string separado por comas para simplificar
  });

  // Agrupar roles por fecha
  const rolesAgrupados = roles.reduce((acc, rol) => {
    if (!acc[rol.fecha]) {
      acc[rol.fecha] = [];
    }
    acc[rol.fecha].push(rol);
    return acc;
  }, {} as { [key: string]: Rol[] });

  // Ordenar fechas
  const fechasOrdenadas = Object.keys(rolesAgrupados).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getBeneficiarioNombre = (beneficiarioId: string) => {
    const beneficiario = beneficiarios.find(b => b.id === beneficiarioId);
    return beneficiario?.nombre || 'Desconocido';
  };

  const handleNuevoRol = () => {
    setEditingRol(null);
    setFormData({
      beneficiarioId: beneficiarios.length > 0 ? beneficiarios[0].id : '',
      tipo: 'cocina',
      fecha: new Date().toISOString().split('T')[0],
      horario: '08:00 - 12:00',
      estado: 'pendiente',
      descripcion: '',
      compañeros: ''
    });
    setModalVisible(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({
      beneficiarioId: rol.beneficiarioId,
      tipo: rol.tipo,
      fecha: rol.fecha,
      horario: rol.horario,
      estado: rol.estado,
      descripcion: rol.descripcion,
      compañeros: rol.compañeros.join(', ')
    });
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!formData.beneficiarioId) {
      Alert.alert('Error', 'Debes seleccionar un beneficiario');
      return;
    }

    const rolData = {
      ...formData,
      compañeros: formData.compañeros.split(',').map(c => c.trim()).filter(c => c !== '')
    };

    try {
      if (editingRol) {
        await actualizarRol(editingRol.id, rolData);
      } else {
        await agregarRol(rolData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el rol');
    }
  };

  const handleEliminar = (rol: Rol) => {
    Alert.alert(
      'Eliminar Rol',
      '¿Estás seguro de eliminar este rol?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarRol(rol.id)
        }
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, fecha: selectedDate.toISOString().split('T')[0] });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Gestión de Roles</Text>
            <Text style={styles.headerSubtitle}>{roles.length} asignaciones</Text>
          </View>
          <TouchableOpacity onPress={handleNuevoRol} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Resumen de estados */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>
              {roles.filter(r => r.estado === 'proximo').length}
            </Text>
            <Text style={[styles.statLabel, { color: '#2563EB' }]}>Próximos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>
              {roles.filter(r => r.estado === 'pendiente').length}
            </Text>
            <Text style={[styles.statLabel, { color: '#D97706' }]}>Pendientes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              {roles.filter(r => r.estado === 'completado').length}
            </Text>
            <Text style={[styles.statLabel, { color: '#059669' }]}>Completados</Text>
          </View>
        </View>

        {/* Lista de roles */}
        {fechasOrdenadas.length > 0 ? (
          fechasOrdenadas.map((fecha, index) => (
            <Animated.View
              key={fecha}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.fechaSection}
            >
              <View style={styles.fechaHeader}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.fechaTitle}>
                  {new Date(fecha).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
              </View>

              {rolesAgrupados[fecha].map((rol) => (
                <View key={rol.id} style={styles.rolCard}>
                  <View style={styles.rolHeader}>
                    <View style={[
                      styles.tipoBadge,
                      { backgroundColor: rol.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }
                    ]}>
                      <Ionicons
                        name={rol.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                        size={14}
                        color={rol.tipo === 'cocina' ? '#F59E0B' : '#3B82F6'}
                      />
                      <Text style={[
                        styles.tipoText,
                        { color: rol.tipo === 'cocina' ? '#F59E0B' : '#3B82F6' }
                      ]}>
                        {rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}
                      </Text>
                    </View>
                    <View style={[
                      styles.estadoBadge,
                      {
                        backgroundColor:
                          rol.estado === 'completado' ? '#ECFDF5' :
                            rol.estado === 'proximo' ? '#EFF6FF' : '#FEF3C7'
                      }
                    ]}>
                      <Text style={[
                        styles.estadoText,
                        {
                          color:
                            rol.estado === 'completado' ? '#059669' :
                              rol.estado === 'proximo' ? '#2563EB' : '#D97706'
                        }
                      ]}>
                        {rol.estado.charAt(0).toUpperCase() + rol.estado.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.beneficiarioName}>
                    {getBeneficiarioNombre(rol.beneficiarioId)}
                  </Text>

                  <View style={styles.rolDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.detailText}>{rol.horario}</Text>
                    </View>
                    {rol.descripcion ? (
                      <View style={styles.detailItem}>
                        <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                        <Text style={styles.detailText} numberOfLines={1}>{rol.descripcion}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.rolActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEditarRol(rol)}
                    >
                      <Ionicons name="create-outline" size={18} color="#ff6a1aff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleEliminar(rol)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#FED7AA" />
            <Text style={styles.emptyTitle}>No hay roles asignados</Text>
            <Text style={styles.emptySubtitle}>Comienza asignando roles a los beneficiarios</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Formulario */}
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
                {editingRol ? 'Editar Rol' : 'Asignar Nuevo Rol'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Beneficiario</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.beneficiariosScroll}>
                  {beneficiarios.map(b => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.beneficiarioChip,
                        formData.beneficiarioId === b.id && styles.beneficiarioChipActive
                      ]}
                      onPress={() => setFormData({ ...formData, beneficiarioId: b.id })}
                    >
                      <Text style={[
                        styles.beneficiarioChipText,
                        formData.beneficiarioId === b.id && styles.beneficiarioChipTextActive
                      ]}>
                        {b.nombre.split(' ')[0]} {b.nombre.split(' ')[1]?.charAt(0)}.
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        formData.tipo === 'cocina' && styles.typeOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, tipo: 'cocina' })}
                    >
                      <Ionicons
                        name="restaurant"
                        size={18}
                        color={formData.tipo === 'cocina' ? 'white' : '#6B7280'}
                      />
                      <Text style={[
                        styles.typeText,
                        formData.tipo === 'cocina' && styles.typeTextActive
                      ]}>Cocina</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        formData.tipo === 'aseo' && styles.typeOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, tipo: 'aseo' })}
                    >
                      <Ionicons
                        name="sparkles"
                        size={18}
                        color={formData.tipo === 'aseo' ? 'white' : '#6B7280'}
                      />
                      <Text style={[
                        styles.typeText,
                        formData.tipo === 'aseo' && styles.typeTextActive
                      ]}>Aseo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Fecha</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                    <Text style={styles.dateButtonText}>{formData.fecha}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Horario</Text>
                <TextInput
                  style={styles.input}
                  value={formData.horario}
                  onChangeText={(t) => setFormData({ ...formData, horario: t })}
                  placeholder="Ej. 08:00 - 12:00"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.statusSelector}>
                  {['pendiente', 'proximo', 'completado'].map((estado) => (
                    <TouchableOpacity
                      key={estado}
                      style={[
                        styles.statusOption,
                        formData.estado === estado && styles.statusOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, estado: estado as any })}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        formData.estado === estado && styles.statusOptionTextActive
                      ]}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.input}
                  value={formData.descripcion}
                  onChangeText={(t) => setFormData({ ...formData, descripcion: t })}
                  placeholder="Detalles del rol..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Compañeros (separados por coma)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.compañeros}
                  onChangeText={(t) => setFormData({ ...formData, compañeros: t })}
                  placeholder="Ej. Juan, Pedro"
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar}>
                <Text style={styles.saveBtnText}>Guardar Rol</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.fecha)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
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
  addButton: {
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
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fechaSection: {
    marginBottom: 24,
  },
  fechaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  fechaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  rolCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  rolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  beneficiarioName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  rolDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  rolActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
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
    marginTop: 8,
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
    borderBottomColor: '#FFF7ED',
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
  },
  beneficiariosScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  beneficiarioChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  beneficiarioChipActive: {
    backgroundColor: '#ff6a1aff',
    borderColor: '#ff6a1aff',
  },
  beneficiarioChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  beneficiarioChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  typeOptionActive: {
    backgroundColor: '#ff6a1aff',
    borderColor: '#ff6a1aff',
  },
  typeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  typeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statusOptionActive: {
    backgroundColor: '#ff6a1aff',
    borderColor: '#ff6a1aff',
  },
  statusOptionText: {
    fontSize: 11,
    color: '#6B7280',
  },
  statusOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#ff6a1aff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});