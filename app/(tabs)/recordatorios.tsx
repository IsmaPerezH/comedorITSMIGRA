
import { useAuth } from '@/context/AuthContext';
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
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RecordatoriosScreen() {
  const { user } = useAuth();
  const {
    roles,
    recordatorios,
    agregarRecordatorio,
    actualizarRecordatorio,
    obtenerRecordatoriosPorBeneficiario
  } = useStorage();

  const beneficiarioActualId = user?.role === 'student' ? user.beneficiarioId : '';

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

  const rolesBeneficiario = roles.filter(rol => rol.beneficiarioId === beneficiarioActualId);
  const recordatoriosBeneficiario = obtenerRecordatoriosPorBeneficiario(beneficiarioActualId);

  const rolesCocina = rolesBeneficiario.filter(rol => rol.tipo === 'cocina' && rol.estado === 'pendiente');
  const rolesAseo = rolesBeneficiario.filter(rol => rol.tipo === 'aseo' && rol.estado === 'pendiente');

  const proximoCocina = rolesCocina.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
  const proximoAseo = rolesAseo.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

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
        await actualizarRecordatorio(recordatorioEditando.id, formData);
        Alert.alert('Éxito', 'Recordatorio actualizado');
      } else {
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

  const editarRecordatorio = (recordatorio: any) => {
    setRecordatorioEditando(recordatorio);
    setFormData({
      tipo: recordatorio.tipo,
      fecha: recordatorio.fecha,
      horaRecordatorio: recordatorio.horaRecordatorio,
      activo: recordatorio.activo
    });

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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="notifications" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Recordatorios</Text>
              <Text style={styles.headerSubtitle}>Alertas para tus turnos</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerta de Permisos */}
        {!permisosNotificaciones && (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.permisosCard}>
            <View style={styles.permisosIcon}>
              <Ionicons name="notifications-off" size={32} color="#F59E0B" />
            </View>
            <View style={styles.permisosContent}>
              <Text style={styles.permisosTitle}>Notificaciones Desactivadas</Text>
              <Text style={styles.permisosText}>
                Activa las notificaciones para recibir recordatorios de tus turnos
              </Text>
              <TouchableOpacity
                style={styles.permisosButton}
                onPress={solicitarPermisosNotificaciones}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.permisosButtonText}>Activar Ahora</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Próximos Turnos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Turnos</Text>

          <View style={styles.turnosContainer}>
            {/* Turno de Cocina */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.turnoCard}>
              <View style={styles.turnoHeader}>
                <View style={[styles.turnoIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="restaurant" size={28} color="#F59E0B" />
                </View>
                <View style={styles.turnoInfo}>
                  <Text style={styles.turnoTitulo}>Turno de Cocina</Text>
                  {proximoCocina ? (
                    <>
                      <Text style={styles.turnoFecha}>{formatearFecha(proximoCocina.fecha)}</Text>
                      <Text style={styles.turnoHorario}>{proximoCocina.horario}</Text>
                      <View style={styles.turnoBadge}>
                        <Ionicons name="time" size={14} color="#059669" />
                        <Text style={styles.turnoDias}>{obtenerDiasHastaTurno(proximoCocina.fecha)}</Text>
                      </View>
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
                <Ionicons name="notifications-outline" size={18} color="white" />
                <Text style={styles.configurarButtonText}>
                  {permisosNotificaciones ? 'Configurar Recordatorio' : 'Sin Permisos'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Turno de Aseo */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.turnoCard}>
              <View style={styles.turnoHeader}>
                <View style={[styles.turnoIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="sparkles" size={28} color="#3B82F6" />
                </View>
                <View style={styles.turnoInfo}>
                  <Text style={styles.turnoTitulo}>Turno de Aseo</Text>
                  {proximoAseo ? (
                    <>
                      <Text style={styles.turnoFecha}>{formatearFecha(proximoAseo.fecha)}</Text>
                      <Text style={styles.turnoHorario}>{proximoAseo.horario}</Text>
                      <View style={styles.turnoBadge}>
                        <Ionicons name="time" size={14} color="#059669" />
                        <Text style={styles.turnoDias}>{obtenerDiasHastaTurno(proximoAseo.fecha)}</Text>
                      </View>
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
                <Ionicons name="notifications-outline" size={18} color="white" />
                <Text style={styles.configurarButtonText}>
                  {permisosNotificaciones ? 'Configurar Recordatorio' : 'Sin Permisos'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Recordatorios Activos */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Recordatorios Activos</Text>
            <Text style={styles.listCount}>
              {recordatoriosBeneficiario.filter(r => r.activo).length} activos
            </Text>
          </View>

          {recordatoriosBeneficiario.filter(r => r.activo).length > 0 ? (
            <View style={styles.recordatoriosList}>
              {recordatoriosBeneficiario.filter(r => r.activo).map((recordatorio, index) => (
                <Animated.View
                  key={recordatorio.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={styles.recordatorioCard}
                >
                  <View style={styles.recordatorioInfo}>
                    <View style={styles.recordatorioHeader}>
                      <View style={[
                        styles.tipoBadge,
                        { backgroundColor: recordatorio.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }
                      ]}>
                        <Ionicons
                          name={recordatorio.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                          size={16}
                          color={recordatorio.tipo === 'cocina' ? '#F59E0B' : '#3B82F6'}
                        />
                        <Text style={[
                          styles.tipoText,
                          { color: recordatorio.tipo === 'cocina' ? '#F59E0B' : '#3B82F6' }
                        ]}>
                          {recordatorio.tipo.charAt(0).toUpperCase() + recordatorio.tipo.slice(1)}
                        </Text>
                      </View>
                      <View style={styles.horaContainer}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.recordatorioHora}>{recordatorio.horaRecordatorio}</Text>
                      </View>
                    </View>

                    <Text style={styles.recordatorioFecha}>{formatearFecha(recordatorio.fecha)}</Text>
                    <View style={styles.recordatorioMeta}>
                      <Ionicons name="calendar-outline" size={14} color="#059669" />
                      <Text style={styles.recordatorioDias}>{obtenerDiasHastaTurno(recordatorio.fecha)}</Text>
                    </View>
                    <View style={styles.notificacionBadge}>
                      <Ionicons name="notifications" size={12} color="#F59E0B" />
                      <Text style={styles.notificacionInfo}>Notificación 30 min antes</Text>
                    </View>
                  </View>

                  <View style={styles.recordatorioActions}>
                    <Switch
                      value={recordatorio.activo}
                      onValueChange={() => toggleRecordatorio(recordatorio)}
                      trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                      thumbColor={recordatorio.activo ? '#2563EB' : '#F3F4F6'}
                    />
                    <TouchableOpacity
                      onPress={() => editarRecordatorio(recordatorio)}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="create-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminarRecordatorio(recordatorio)}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeInDown} style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>
                {permisosNotificaciones ? 'No hay recordatorios activos' : 'Notificaciones desactivadas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {permisosNotificaciones
                  ? 'Configura recordatorios para tus próximos turnos'
                  : 'Activa las notificaciones para usar recordatorios'}
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Modal Moderno */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIcon}>
                  <Ionicons name="notifications-outline" size={24} color="#2563EB" />
                </View>
                <Text style={styles.modalTitle}>
                  {recordatorioEditando ? 'Editar Recordatorio' : 'Configurar Recordatorio'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {!permisosNotificaciones && (
                <View style={styles.permisosAdvertencia}>
                  <Ionicons name="warning" size={20} color="#F59E0B" />
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
                      color={formData.tipo === 'cocina' ? 'white' : '#F59E0B'}
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
                      color={formData.tipo === 'aseo' ? 'white' : '#3B82F6'}
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
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={formData.fecha}
                    onChangeText={(text) => setFormData({ ...formData, fecha: text })}
                  />
                </View>
                <Text style={styles.helperText}>Formato: AAAA-MM-DD (ej: 2025-11-25)</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hora del Recordatorio</Text>
                <TouchableOpacity
                  style={styles.horaButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.horaText}>{formData.horaRecordatorio}</Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                <Text style={styles.helperText}>Recibirás la notificación 30 minutos antes</Text>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={horaSeleccionada}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onHoraChange}
                />
              )}

              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Ionicons
                    name={formData.activo ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={formData.activo ? "#059669" : "#DC2626"}
                  />
                  <Text style={styles.label}>Recordatorio activo</Text>
                </View>
                <Switch
                  value={formData.activo}
                  onValueChange={(value) => setFormData({ ...formData, activo: value })}
                  trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                  thumbColor={formData.activo ? '#2563EB' : '#F3F4F6'}
                  disabled={!permisosNotificaciones}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={guardarRecordatorio}
                style={[
                  styles.saveBtn,
                  (!formData.fecha || !permisosNotificaciones) && styles.saveBtnDisabled
                ]}
                disabled={!formData.fecha || !permisosNotificaciones}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text style={styles.saveBtnText}>
                  {recordatorioEditando ? 'Actualizar' : 'Guardar'}
                </Text>
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
  permisosCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    flexDirection: 'row',
    gap: 16,
  },
  permisosIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permisosContent: {
    flex: 1,
  },
  permisosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  permisosText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 12,
  },
  permisosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  permisosButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  turnosContainer: {
    gap: 12,
  },
  turnoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  turnoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  turnoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  turnoInfo: {
    flex: 1,
  },
  turnoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  turnoFecha: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  turnoHorario: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  turnoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  turnoDias: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  turnoVacio: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  configurarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  configurarButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  configurarButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  recordatoriosList: {
    gap: 12,
  },
  recordatorioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordatorioInfo: {
    flex: 1,
  },
  recordatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  horaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordatorioHora: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordatorioFecha: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  recordatorioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  recordatorioDias: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  notificacionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificacionInfo: {
    fontSize: 12,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  recordatorioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  permisosAdvertencia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  permisosAdvertenciaText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
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
  tipoOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  tipoOptionActive: {
    backgroundColor: '#2563EB',
  },
  tipoOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipoOptionTextActive: {
    color: 'white',
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
  horaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  horaText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
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
  saveBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
