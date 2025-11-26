
// app/admin/beneficiarios.tsx - Gestión de beneficiarios con campo de contraseña
import { Beneficiario, useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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

  // Filtrar beneficiarios según búsqueda
  const beneficiariosFiltrados = beneficiarios.filter(beneficiario =>
    beneficiario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beneficiario.matricula.includes(searchQuery)
  );

  // Abrir modal para nuevo beneficiario
  const handleNuevoBeneficiario = () => {
    setEditingBeneficiario(null);
    setFormData({
      nombre: '',
      matricula: '',
      activo: true,
      password: ''
    });
    setModalVisible(true);
  };

  // Abrir modal para editar beneficiario
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

  // Guardar beneficiario
  const handleGuardar = async () => {
    if (!formData.nombre.trim() || !formData.matricula.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!editingBeneficiario && !formData.password.trim()) {
      Alert.alert('Error', 'La contraseña es obligatoria para nuevos beneficiarios');
      return;
    }

    // Verificar si la matrícula ya existe
    if (matriculaExiste(formData.matricula, editingBeneficiario?.id)) {
      Alert.alert('Error', 'Ya existe un beneficiario con esta matrícula');
      return;
    }

    try {
      if (editingBeneficiario) {
        // Actualizar beneficiario existente
        await actualizarBeneficiario(editingBeneficiario.id, formData);
        Alert.alert('Éxito', 'Beneficiario actualizado correctamente');
      } else {
        // Crear nuevo beneficiario
        await agregarBeneficiario(formData);
        Alert.alert('Éxito', 'Beneficiario creado correctamente');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar el beneficiario');
      console.error('Error guardando beneficiario:', error);
    }
  };

  // Eliminar beneficiario
  const handleEliminar = (beneficiario: Beneficiario) => {
    Alert.alert(
      'Eliminar Beneficiario',
      `¿Estás seguro de eliminar a ${beneficiario.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarBeneficiario(beneficiario.id);
              Alert.alert('Éxito', 'Beneficiario eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'Hubo un problema al eliminar el beneficiario');
              console.error('Error eliminando beneficiario:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Beneficiarios</Text>
        <TouchableOpacity onPress={handleNuevoBeneficiario} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o matrícula..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{beneficiarios.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {beneficiarios.filter(b => b.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {beneficiarios.filter(b => !b.activo).length}
          </Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
      </View>

      {/* Lista de beneficiarios */}
      <ScrollView style={styles.content}>
        {beneficiariosFiltrados.length > 0 ? (
          <View style={styles.beneficiariosList}>
            {beneficiariosFiltrados.map((beneficiario) => (
              <View key={beneficiario.id} style={styles.beneficiarioCard}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
                <View style={styles.beneficiarioInfo}>
                  <Text style={styles.nombre}>{beneficiario.nombre}</Text>
                  <Text style={styles.matricula}>Matrícula: {beneficiario.matricula}</Text>
                </View>
                <View style={styles.actions}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: beneficiario.activo ? '#4CAF50' : '#f44336' }
                  ]}>
                    <Text style={styles.statusText}>
                      {beneficiario.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEditarBeneficiario(beneficiario)}
                    style={styles.editButton}
                  >
                    <Ionicons name="create" size={18} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEliminar(beneficiario)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No se encontraron resultados' : 'No hay beneficiarios'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer beneficiario'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para agregar/editar beneficiario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Brenda Vásquez Cruz"
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Matrícula *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 22105081"
                  value={formData.matricula}
                  onChangeText={(text) => setFormData({ ...formData, matricula: text })}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <Text style={styles.helperText}>
                  {matriculaExiste(formData.matricula, editingBeneficiario?.id)
                    ? '⚠️ Esta matrícula ya está en uso'
                    : 'La matrícula debe ser única'
                  }
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña {!editingBeneficiario && '*'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={editingBeneficiario ? "Dejar vacío para mantener la actual" : "Ej: 123456"}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  maxLength={20}
                />
                <Text style={styles.helperText}>
                  {editingBeneficiario
                    ? 'Dejar vacío para no cambiar la contraseña'
                    : 'Contraseña para iniciar sesión'
                  }
                </Text>
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Estado activo</Text>
                <Switch
                  value={formData.activo}
                  onValueChange={(value) => setFormData({ ...formData, activo: value })}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={formData.activo ? '#2196F3' : '#f4f3f4'}
                />
              </View>

              <Text style={styles.requiredText}>* Campos obligatorios</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGuardar}
                  style={[
                    styles.saveButton,
                    (!formData.nombre.trim() || !formData.matricula.trim() || (!editingBeneficiario && !formData.password.trim())) && styles.saveButtonDisabled
                  ]}
                  disabled={!formData.nombre.trim() || !formData.matricula.trim() || (!editingBeneficiario && !formData.password.trim())}
                >
                  <Text style={styles.saveButtonText}>
                    {editingBeneficiario ? 'Actualizar' : 'Guardar'}
                  </Text>
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  beneficiariosList: {
    gap: 12,
  },
  beneficiarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  beneficiarioInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  matricula: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    marginBottom: 20,
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
    backgroundColor: '#fafafa',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1a237e',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});