import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RolesScreen() {
    const { roles } = useStorage();
    const beneficiarioActualId = '1'; // Simulado
    const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'completado'>('todos');

    const misRoles = roles.filter(r => r.beneficiarioId === beneficiarioActualId);

    const rolesFiltrados = misRoles.filter(r => {
        if (filtro === 'todos') return true;
        if (filtro === 'pendiente') return r.estado === 'pendiente' || r.estado === 'proximo';
        return r.estado === filtro;
    });

    const getIconoTipo = (tipo: string) => {
        return tipo === 'cocina' ? 'restaurant' : 'sparkles';
    };

    const getColorTipo = (tipo: string) => {
        return tipo === 'cocina' ? '#F59E0B' : '#3B82F6';
    };

    const getBgTipo = (tipo: string) => {
        return tipo === 'cocina' ? '#FEF3C7' : '#DBEAFE';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="calendar" size={28} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Mis Roles</Text>
                            <Text style={styles.headerSubtitle}>Gestión de turnos y actividades</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Filtros */}
            <View style={styles.filtrosContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContent}>
                    {['todos', 'pendiente', 'completado'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
                            onPress={() => setFiltro(f as any)}
                        >
                            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de Roles */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {rolesFiltrados.length > 0 ? (
                    rolesFiltrados.map((rol, index) => (
                        <Animated.View
                            key={rol.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: getBgTipo(rol.tipo) }]}>
                                    <Ionicons name={getIconoTipo(rol.tipo)} size={24} color={getColorTipo(rol.tipo)} />
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.cardTitle}>
                                        Turno de {rol.tipo.charAt(0).toUpperCase() + rol.tipo.slice(1)}
                                    </Text>
                                    <View style={styles.badgeContainer}>
                                        <View style={[
                                            styles.badge,
                                            { backgroundColor: rol.estado === 'completado' ? '#D1FAE5' : '#FEF3C7' }
                                        ]}>
                                            <Text style={[
                                                styles.badgeText,
                                                { color: rol.estado === 'completado' ? '#059669' : '#D97706' }
                                            ]}>
                                                {rol.estado.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.row}>
                                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                    <Text style={styles.rowText}>{new Date(rol.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                                    <Text style={styles.rowText}>{rol.horario}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                                    <Text style={styles.rowText}>{rol.descripcion}</Text>
                                </View>

                                {rol.compañeros && rol.compañeros.length > 0 && (
                                    <View style={styles.compañerosContainer}>
                                        <Text style={styles.compañerosLabel}>Compañeros:</Text>
                                        <View style={styles.compañerosList}>
                                            {rol.compañeros.map((comp, idx) => (
                                                <View key={idx} style={styles.compañeroChip}>
                                                    <Ionicons name="person-circle-outline" size={16} color="#4B5563" />
                                                    <Text style={styles.compañeroText}>{comp}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-clear-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No hay roles {filtro === 'todos' ? '' : filtro}s</Text>
                    </View>
                )}
            </ScrollView>
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
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    filtrosContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    filtrosContent: {
        gap: 10,
        paddingRight: 20,
    },
    filtroChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filtroChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    filtroText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filtroTextActive: {
        color: 'white',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    compañerosContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    compañerosLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 6,
    },
    compañerosList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    compañeroChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    compañeroText: {
        fontSize: 12,
        color: '#4B5563',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
    },
});
