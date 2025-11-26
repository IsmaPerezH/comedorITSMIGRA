// hooks/useNotifications.ts - NUEVO HOOK PARA NOTIFICACIONES
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export interface NotificationConfig {
  title: string;
  body: string;
  data?: any;
}

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isExpoGo, setIsExpoGo] = useState<boolean>(true);

  // Verificar si estamos en Expo Go
  useEffect(() => {
    // @ts-ignore
    setIsExpoGo(Constants.appOwnership === 'expo');
  }, []);

  // Configurar manejador de notificaciones
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // Solicitar permisos
  const solicitarPermisos = async (): Promise<boolean> => {
    if (isExpoGo) {
      Alert.alert(
        'Notificaciones en Expo Go',
        'Las notificaciones push no están disponibles en Expo Go. ' +
        'Usa un Development Build para probar notificaciones reales.\n\n' +
        'Por ahora, las notificaciones se simularán localmente.',
        [{ text: 'Entendido' }]
      );
      return true; // Simulamos que los permisos están concedidos
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } else {
      Alert.alert('Debes usar un dispositivo físico para notificaciones');
      return false;
    }
  };

  // Programar notificación local
  const programarNotificacionLocal = async (config: NotificationConfig, trigger: Date): Promise<boolean> => {
    try {
      if (isExpoGo) {
        // En Expo Go, mostramos una alerta simulada
        const tiempoRestante = trigger.getTime() - Date.now();
        const minutos = Math.max(1, Math.round(tiempoRestante / (60 * 1000)));

        Alert.alert(
          '📱 Notificación Simulada',
          `En un Development Build recibirías:\n\n` +
          `🔔 ${config.title}\n` +
          `📝 ${config.body}\n\n` +
          `⏰ En aproximadamente ${minutos} minutos`,
          [{ text: 'OK' }]
        );
        return true;
      }

      // En Development Build, notificación real
      await Notifications.scheduleNotificationAsync({
        content: config,
        trigger: trigger as unknown as Notifications.NotificationTriggerInput,
      });

      return true;
    } catch (error) {
      console.error('Error programando notificación:', error);
      return false;
    }
  };

  // Programar recordatorio
  const programarRecordatorio = async (
    tipo: 'cocina' | 'aseo',
    fecha: string,
    horaRecordatorio: string
  ): Promise<boolean> => {
    const permisos = await solicitarPermisos();
    if (!permisos) return false;

    const fechaTurno = new Date(fecha);
    const [hora, minuto] = horaRecordatorio.split(':').map(Number);

    fechaTurno.setHours(hora, minuto, 0, 0);

    // Verificar que la fecha no sea en el pasado
    if (fechaTurno <= new Date()) {
      Alert.alert('Error', 'La fecha del recordatorio no puede ser en el pasado');
      return false;
    }

    const trigger = new Date(fechaTurno.getTime() - 30 * 60 * 1000); // 30 minutos antes

    const config: NotificationConfig = {
      title: `🔔 Recordatorio: Turno de ${tipo}`,
      body: `Tu turno de ${tipo} comienza a las ${horaRecordatorio}`,
      data: { tipo, fecha },
    };

    return await programarNotificacionLocal(config, trigger);
  };

  // Cancelar notificación por ID (simulado o real)
  const cancelarNotificacion = async (id: string) => {
    if (!isExpoGo) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  };

  // Cancelar todas las notificaciones
  const cancelarTodasNotificaciones = async () => {
    if (!isExpoGo) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return {
    expoPushToken,
    isExpoGo,
    solicitarPermisos,
    programarRecordatorio,
    cancelarNotificacion,
    cancelarTodasNotificaciones,
  };
};