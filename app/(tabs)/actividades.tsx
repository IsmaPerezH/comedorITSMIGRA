import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ActividadesScreen() {
    const { user } = useAuth();
    const { roles, asistencias } = useStorage();
    const [activeTab, setActiveTab] = useState<'agenda' | 'historial'>('agenda');

    // Filtrar datos
    const misRoles = user && user.role === 'student'
        ? roles.filter(r => r.beneficiarioId === user.uid).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        : [];

    const misAsistencias = user && user.role === 'student'
        ? asistencias.filter(a => a.beneficiarioId === user.uid).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Estilo Admin */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Mis Actividades</Text>
                        <Text style={styles.headerSubtitle}>Agenda y registro de asistencia</Text>
                    </View>
                    <View style={styles.iconButton}>
                        <Ionicons name="calendar-outline" size={24} color="white" />
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'agenda' && styles.activeTab]}
                    onPress={() => setActiveTab('agenda')}
                >
                    <Text style={[styles.tabText, activeTab === 'agenda' && styles.activeTabText]}>Agenda</Text>
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
                        {misRoles.length > 0 ? (
                            misRoles.map((rol, index) => (
                                <Animated.View
                                    key={rol.id}
                                    entering={FadeInDown.delay(index * 100)}
                                    style={styles.card}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: rol.tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE' }]}>
                                        <Ionicons
                                            name={rol.tipo === 'cocina' ? 'restaurant' : 'sparkles'}
                                            size={24}
                                            color={rol.tipo === 'cocina' ? '#D97706' : '#2563EB'}
                                        />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>Rol de {rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}</Text>
                                        <Text style={styles.cardDate}>
                                            {new Date(rol.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </Text>
                                        <Text style={styles.cardSubtitle}>{rol.horario}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: rol.estado === 'completado' ? '#D1FAE5' : '#EFF6FF' }]}>
                                        <Text style={[styles.statusText, { color: rol.estado === 'completado' ? '#059669' : '#2563EB' }]}>
                                            {rol.estado === 'completado' ? 'Listo' : 'Pendiente'}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="#A8A29E" />
                                <Text style={styles.emptyText}>No tienes roles asignados próximamente</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        {misAsistencias.length > 0 ? (
                            misAsistencias.map((asistencia, index) => (
                                <Animated.View
                                    key={asistencia.id}
                                    entering={FadeInDown.delay(index * 50)}
                                    style={styles.card}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
                                        <Ionicons name="checkmark-circle" size={24} color="#059669" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>Asistencia Registrada</Text>
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
                                <Ionicons name="time-outline" size={48} color="#A8A29E" />
                                <Text style={styles.emptyText}>No hay historial de asistencias</Text>
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
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
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
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#A8A29E',
        textAlign: 'center',
    },
});
