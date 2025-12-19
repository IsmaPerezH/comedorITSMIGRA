import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ActividadesScreen() {
    const { user } = useAuth();
    const { roles, asistencias, recordatorios, permisos } = useStorage();
    const [activeTab, setActiveTab] = useState<'agenda' | 'historial'>('agenda');

    // 1. Obtener datos del usuario actual
    const userId = user?.role === 'student' ? user.uid : '';

    // 2. Unificar eventos para la AGENDA (Futuros/Pendientes)
    const eventosAgenda = useMemo(() => {
        if (!userId) return [];

        const listaEventos: any[] = [];

        // Roles Pendientes
        const misRoles = roles.filter(r => r.beneficiarioId === userId && r.estado !== 'completado');
        misRoles.forEach(rol => {
            listaEventos.push({
                id: rol.id,
                tipo: 'rol',
                subtipo: rol.tipo, // 'cocina' | 'aseo'
                fecha: rol.fecha,
                titulo: `Rol de ${rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}`,
                detalle: rol.horario,
                estado: rol.estado
            });
        });

        // Recordatorios Activos
        const misRecordatorios = recordatorios.filter(r => r.beneficiarioId === userId && r.activo);
        misRecordatorios.forEach(rec => {
            listaEventos.push({
                id: rec.id,
                tipo: 'recordatorio',
                subtipo: rec.tipo,
                fecha: rec.fecha,
                titulo: 'Recordatorio',
                detalle: `${rec.horaRecordatorio} - ${rec.tipo.toUpperCase()}`,
                estado: 'activo'
            });
        });

        // Permisos Solicitados (Futuros o Recientes)
        const misPermisos = permisos.filter(p => p.beneficiarioId === userId);
        misPermisos.forEach(per => {
            listaEventos.push({
                id: per.id,
                tipo: 'permiso',
                subtipo: 'general',
                fecha: per.fecha,
                titulo: 'Permiso Solicitado',
                detalle: per.motivo,
                estado: per.estado // 'aprobado' | 'pendiente'
            });
        });

        // Ordenar por fecha (más cercano primero)
        return listaEventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    }, [userId, roles, recordatorios, permisos]);

    // 3. Historial de Asistencias (Pasado)
    const historialAsistencias = useMemo(() => {
        if (!userId) return [];
        return asistencias
            .filter(a => a.beneficiarioId === userId)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [userId, asistencias]);

    const renderIcon = (item: any) => {
        if (item.tipo === 'rol') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: item.subtipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }]}>
                    <Ionicons
                        name={item.subtipo === 'cocina' ? 'restaurant' : 'sparkles'}
                        size={24}
                        color={item.subtipo === 'cocina' ? '#D97706' : '#2563EB'}
                    />
                </View>
            );
        } else if (item.tipo === 'recordatorio') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="notifications" size={24} color="#DC2626" />
                </View>
            );
        } else { // Permiso
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="document-text" size={24} color="#059669" />
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Estilo Admin */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Mi Agenda</Text>
                        <Text style={styles.headerSubtitle}>Roles, recordatorios y permisos</Text>
                    </View>
                    <View style={styles.iconButton}>
                        <Ionicons name="calendar" size={24} color="white" />
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'agenda' && styles.activeTab]}
                    onPress={() => setActiveTab('agenda')}
                >
                    <Text style={[styles.tabText, activeTab === 'agenda' && styles.activeTabText]}>Próximos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
                    onPress={() => setActiveTab('historial')}
                >
                    <Text style={[styles.tabText, activeTab === 'historial' && styles.activeTabText]}>Historial</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {activeTab === 'agenda' ? (
                    <View>
                        {eventosAgenda.length > 0 ? (
                            eventosAgenda.map((item, index) => (
                                <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)} style={styles.card}>
                                    {renderIcon(item)}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{item.titulo}</Text>
                                        <Text style={styles.cardDate}>
                                            {new Date(item.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </Text>
                                        <Text style={styles.cardSubtitle}>{item.detalle}</Text>
                                    </View>

                                    {/* Badge Lateral opcional según tipo */}
                                    {item.tipo === 'permiso' && (
                                        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                                            <Text style={[styles.statusText, { color: '#059669' }]}>Sí</Text>
                                        </View>
                                    )}
                                </Animated.View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color="#D6D3D1" />
                                <Text style={styles.emptyText}>No tienes actividades pendientes</Text>
                                <Text style={styles.emptySubtext}>Tus roles y recordatorios aparecerán aquí</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        {historialAsistencias.length > 0 ? (
                            historialAsistencias.map((asistencia, index) => (
                                <Animated.View key={asistencia.id} entering={FadeInDown.delay(index * 50)} style={styles.card}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                                        <Ionicons name="checkmark-done" size={24} color="#4B5563" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>Asistencia</Text>
                                        <Text style={styles.cardDate}>
                                            {new Date(asistencia.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </Text>
                                        <Text style={styles.cardSubtitle}>
                                            {asistencia.tipo.charAt(0).toUpperCase() + asistencia.tipo.slice(1)} • {asistencia.hora}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={64} color="#D6D3D1" />
                                <Text style={styles.emptyText}>Sin historial reciente</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
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
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 20,
        marginVertical: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#ff6a1aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#78716C',
    },
    activeTabText: {
        color: '#ff6a1aff',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#ff6a1aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 14,
        color: '#ea580c', // Naranja oscuro para resaltar fecha
        fontWeight: '600',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#57534E',
        textAlign: 'center',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#A8A29E',
        textAlign: 'center',
    },
});
