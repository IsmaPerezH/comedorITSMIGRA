// app/(tabs)/recordatorios.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RecordatoriosScreen() {
  const {
    roles,
    recordatorios,
    agregarRecordatorio,
    actualizarRecordatorio,
    obtenerRecordatoriosPorBeneficiario
  } = useStorage();

  // ID del beneficiario actual
  const beneficiarioActualId = '1';

  const [modalVisible, setModalVisible] = useState(false);
  const [recordatorioEditando, setRecordatorioEditando] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState(new Date());
  const [permisosNotificaciones, setPermisosNotificaciones] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'cocina' as 'cocina' | 'aseo',
    fecha: '',
    horaRecordatorio: '08:00',
    activo: true
  });

  // Verificar permisos de notificaciones al cargar
  useEffect(() => {
    verificarPermisosNotificaciones();
  }, []);

  const verificarPermisosNotificaciones = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermisosNotificaciones(status === 'granted');
  };

  const solicitarPermisosNotificaciones = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermisosNotificaciones(status === 'granted');

    if (status === 'granted') {
      Alert.alert('Éxito', 'Permisos de notificación concedidos');
    } else {
      Alert.alert('Aviso', 'Los recordatorios no funcionarán sin permisos de notificación');
    }
  };

  // Obtener roles del beneficiario
  const rolesBeneficiario = roles.filter(rol => rol.beneficiarioId === beneficiarioActualId);
  const recordatoriosBeneficiario = obtenerRecordatoriosPorBeneficiario(beneficiarioActualId);

  // Agrupar roles por tipo
  const rolesCocina = rolesBeneficiario.filter(rol => rol.tipo === 'cocina' && rol.estado === 'pendiente');
  const rolesAseo = rolesBeneficiario.filter(rol => rol.tipo === 'aseo' && rol.estado === 'pendiente');

  // Encontrar el próximo rol de cada tipo
  const proximoCocina = rolesCocina.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
  const proximoAseo = rolesAseo.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  // Configurar recordatorio automáticamente
  const configurarRecordatorioAutomatico = async (tipo: 'cocina' | 'aseo') => {
    if (!permisosNotificaciones) {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitas permitir las notificaciones para usar los recordatorios',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar Permisos', onPress: solicitarPermisosNotificaciones }
        ]
      );
      return;
    }

    const proximoRol = tipo === 'cocina' ? proximoCocina : proximoAseo;

    if (!proximoRol) {
      Alert.alert('Info', `No tienes roles de ${tipo} pendientes`);
      return;
    }

    // Verificar si ya existe un recordatorio para esta fecha y tipo
    const recordatorioExistente = recordatoriosBeneficiario.find(
      r => r.tipo === tipo && r.fecha === proximoRol.fecha
    );

    if (recordatorioExistente) {
      Alert.alert('Info', 'Ya tienes un recordatorio configurado para este turno');
      return;
    }

    setFormData({
      tipo,
      fecha: proximoRol.fecha,
      horaRecordatorio: '08:00',
      activo: true
    });
    setRecordatorioEditando(null);
    setModalVisible(true);
  };

  // Manejar cambio de hora
  const onHoraChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setHoraSeleccionada(selectedTime);
      const horas = selectedTime.getHours().toString().padStart(2, '0');
      const minutos = selectedTime.getMinutes().toString().padStart(2, '0');
      setFormData({
        ...formData,
        horaRecordatorio: `${horas}:${minutos}`
      });
    }
  };

  // Guardar recordatorio
  const guardarRecordatorio = async () => {
    if (!formData.fecha) {
      Alert.alert('Error', 'Selecciona una fecha para el recordatorio');
      return;
    }

    if (!permisosNotificaciones) {
      Alert.alert('Permisos Requeridos', 'Debes permitir las notificaciones para guardar recordatorios');
      return;
    }

    try {
      if (recordatorioEditando) {
        // Actualizar recordatorio existente
        await actualizarRecordatorio(recordatorioEditando.id, formData);
        Alert.alert('Éxito', 'Recordatorio actualizado');
      } else {
        // Crear nuevo recordatorio
        await agregarRecordatorio({
          beneficiarioId: beneficiarioActualId,
          ...formData
        });
        Alert.alert('Éxito', 'Recordatorio configurado\n\nRecibirás una notificación 30 minutos antes de tu turno');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el recordatorio');
      console.error('Error guardando recordatorio:', error);
    }
  };

  // Resto de funciones permanecen igual...
  const editarRecordatorio = (recordatorio: any) => {
    setRecordatorioEditando(recordatorio);
    setFormData({
      tipo: recordatorio.tipo,
      fecha: recordatorio.fecha,
      horaRecordatorio: recordatorio.horaRecordatorio,
      activo: recordatorio.activo
    });

    // Configurar la hora seleccionada
    const [horas, minutos] = recordatorio.horaRecordatorio.split(':').map(Number);
    const fechaHora = new Date();
    fechaHora.setHours(horas, minutos, 0, 0);
    setHoraSeleccionada(fechaHora);

    setModalVisible(true);
  };

  const toggleRecordatorio = async (recordatorio: any) => {
    try {
      await actualizarRecordatorio(recordatorio.id, {
        activo: !recordatorio.activo
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el recordatorio');
    }
  };

  const eliminarRecordatorio = (recordatorio: any) => {
    Alert.alert(
      'Eliminar Recordatorio',
      '¿Estás seguro de eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await actualizarRecordatorio(recordatorio.id, { activo: false });
              Alert.alert('Éxito', 'Recordatorio eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            }
          }
        },
      ]
    );
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener días hasta el turno
  const obtenerDiasHastaTurno = (fecha: string) => {
    const hoy = new Date();
    const fechaTurno = new Date(fecha);
    const diferencia = fechaTurno.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    if (dias < 0) return 'Pasado';
    return `En ${dias} días`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Recordatorios</Text>
        <Text style={styles.subtitle}>Configura alertas para tus turnos</Text>
      </View>

      {/* Estado de Permisos */}
      {!permisosNotificaciones && (
        <View style={styles.permisosContainer}>
          <View style={styles.permisosContent}>
            <Ionicons name="notifications-off" size={24} color="#FF9800" />
            <View style={styles.permisosText}>
              <Text style={styles.permisosTitle}>Notificaciones Desactivadas</Text>
              <Text style={styles.permisosDescription}>
                Activa las notificaciones para recibir recordatorios de tus turnos
              </Text>
            </View>
            <TouchableOpacity
              style={styles.permisosButton}
              onPress={solicitarPermisosNotificaciones}
            >
              <Text style={styles.permisosButtonText}>Activar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Próximos Turnos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Turnos</Text>

        <View style={styles.turnosContainer}>
          {/* Turno de Cocina */}
          <View style={styles.turnoCard}>
            <View style={styles.turnoHeader}>
              <View style={[styles.turnoIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="restaurant" size={24} color="white" />
              </View>
              <View style={styles.turnoInfo}>
                <Text style={styles.turnoTitulo}>Próximo turno de cocina</Text>
                {proximoCocina ? (
                  <>
                    <Text style={styles.turnoFecha}>
                      {formatearFecha(proximoCocina.fecha)}
                    </Text>
                    <Text style={styles.turnoHorario}>{proximoCocina.horario}</Text>
                    <Text style={styles.turnoDias}>
                      {obtenerDiasHastaTurno(proximoCocina.fecha)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.turnoVacio}>No hay turnos pendientes</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.configurarButton,
                (!proximoCocina || !permisosNotificaciones) && styles.configurarButtonDisabled
              ]}
              onPress={() => configurarRecordatorioAutomatico('cocina')}
              disabled={!proximoCocina || !permisosNotificaciones}
            >
              <Ionicons name="notifications" size={16} color="white" />
              <Text style={styles.configurarButtonText}>
                {permisosNotificaciones ? 'Configurar Recordatorio' : 'Sin Permisos'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Turno de Aseo */}
          <View style={styles.turnoCard}>
            <View style={styles.turnoHeader}>
              <View style={[styles.turnoIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
              <View style={styles.turnoInfo}>
                <Text style={styles.turnoTitulo}>Próximo turno de aseo</Text>
                {proximoAseo ? (
                  <>
                    <Text style={styles.turnoFecha}>
                      {formatearFecha(proximoAseo.fecha)}
                    </Text>
                    <Text style={styles.turnoHorario}>{proximoAseo.horario}</Text>
                    <Text style={styles.turnoDias}>
                      {obtenerDiasHastaTurno(proximoAseo.fecha)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.turnoVacio}>No hay turnos pendientes</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.configurarButton,
                (!proximoAseo || !permisosNotificaciones) && styles.configurarButtonDisabled
              ]}
              onPress={() => configurarRecordatorioAutomatico('aseo')}
              disabled={!proximoAseo || !permisosNotificaciones}
            >
              <Ionicons name="notifications" size={16} color="white" />
              <Text style={styles.configurarButtonText}>
                {permisosNotificaciones ? 'Configurar Recordatorio' : 'Sin Permisos'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recordatorios Activos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recordatorios Activos</Text>
          <Text style={styles.recordatoriosCount}>
            {recordatoriosBeneficiario.filter(r => r.activo).length} activos
          </Text>
        </View>

        {recordatoriosBeneficiario.filter(r => r.activo).length > 0 ? (
          <View style={styles.recordatoriosList}>
            {recordatoriosBeneficiario.filter(r => r.activo).map((recordatorio) => (
              <View key={recordatorio.id} style={styles.recordatorioCard}>
                <View style={styles.recordatorioInfo}>
                  <View style={styles.recordatorioHeader}>
                    <View style={[
                      styles.tipoBadge,
                      { backgroundColor: recordatorio.tipo === 'cocina' ? '#FF9800' : '#2196F3' }
                    ]}>
                      <Ionicons
                        name={recordatorio.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                        size={14}
                        color="white"
                      />
                      <Text style={styles.tipoText}>
                        {recordatorio.tipo.charAt(0).toUpperCase() + recordatorio.tipo.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.recordatorioHora}>
                      {recordatorio.horaRecordatorio}
                    </Text>
                  </View>

                  <Text style={styles.recordatorioFecha}>
                    {formatearFecha(recordatorio.fecha)}
                  </Text>
                  <Text style={styles.recordatorioDias}>
                    {obtenerDiasHastaTurno(recordatorio.fecha)}
                  </Text>
                  <Text style={styles.notificacionInfo}>
                    🔔 Notificación 30 min antes
                  </Text>
                </View>

                <View style={styles.recordatorioActions}>
                  <Switch
                    value={recordatorio.activo}
                    onValueChange={() => toggleRecordatorio(recordatorio)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={recordatorio.activo ? '#2196F3' : '#f4f3f4'}
                  />
                  <TouchableOpacity
                    onPress={() => editarRecordatorio(recordatorio)}
                    style={styles.editarButton}
                  >
                    <Ionicons name="create" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => eliminarRecordatorio(recordatorio)}
                    style={styles.eliminarButton}
                  >
                    <Ionicons name="trash" size={18} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {permisosNotificaciones ? 'No hay recordatorios activos' : 'Notificaciones desactivadas'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {permisosNotificaciones
                ? 'Configura recordatorios para tus próximos turnos'
                : 'Activa las notificaciones para usar recordatorios'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Modal para configurar recordatorio */}
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
                {recordatorioEditando ? 'Editar Recordatorio' : 'Configurar Recordatorio'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {!permisosNotificaciones && (
                <View style={styles.permisosAdvertencia}>
                  <Ionicons name="warning" size={20} color="#FF9800" />
                  <Text style={styles.permisosAdvertenciaText}>
                    Las notificaciones están desactivadas. Los recordatorios no funcionarán.
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Turno</Text>
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
                <Text style={styles.label}>Fecha del Turno</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.fecha}
                  onChangeText={(text) => setFormData({ ...formData, fecha: text })}
                />
                <Text style={styles.helperText}>
                  Formato: AAAA-MM-DD (ej: 2025-11-25)
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hora del Recordatorio</Text>
                <TouchableOpacity
                  style={styles.horaButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#666" />
                  <Text style={styles.horaText}>{formData.horaRecordatorio}</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Recibirás la notificación 30 minutos antes
                </Text>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={horaSeleccionada}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onHoraChange}
                />
              )}

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Recordatorio activo</Text>
                <Switch
                  value={formData.activo}
                  onValueChange={(value) => setFormData({ ...formData, activo: value })}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={formData.activo ? '#2196F3' : '#f4f3f4'}
                  disabled={!permisosNotificaciones}
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
                  onPress={guardarRecordatorio}
                  style={[
                    styles.saveButton,
                    (!formData.fecha || !permisosNotificaciones) && styles.saveButtonDisabled
                  ]}
                  disabled={!formData.fecha || !permisosNotificaciones}
                >
                  <Text style={styles.saveButtonText}>
                    {recordatorioEditando ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recordatoriosCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  turnosContainer: {
    gap: 16,
  },
  turnoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  turnoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  turnoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  turnoInfo: {
    flex: 1,
  },
  turnoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  turnoFecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  turnoHorario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  turnoDias: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  turnoVacio: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  configurarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  configurarButtonDisabled: {
    backgroundColor: '#ccc',
  },
  configurarButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  recordatoriosList: {
    gap: 12,
  },
  recordatorioCard: {
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
  recordatorioInfo: {
    flex: 1,
  },
  recordatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordatorioHora: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordatorioFecha: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  recordatorioDias: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  notificacionInfo: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  recordatorioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editarButton: {
    padding: 6,
  },
  eliminarButton: {
    padding: 6,
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
  permisosAdvertencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  permisosAdvertenciaText: {
    flex: 1,
    fontSize: 12,
    color: '#f57c00',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  horaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  horaText: {
    fontSize: 16,
    color: '#333',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  permisosContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  permisosContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  permisosText: {
    flex: 1,
  },
  permisosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 2,
  },
  permisosDescription: {
    fontSize: 12,
    color: '#f57c00',
  },
  permisosButton: {
    backgroundColor: '#f57c00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  permisosButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});