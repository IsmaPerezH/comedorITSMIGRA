import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Estilo Admin */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Mi Perfil</Text>
                        <Text style={styles.headerSubtitle}>Información personal</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/actividades')} style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Tarjeta de Perfil Elevada */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.nombre?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
                    <Text style={styles.userRole}>
                        {user?.role === 'student' ? 'Beneficiario' : 'Administrador'}
                    </Text>
                    {user?.role === 'student' && (
                        <View style={styles.matriculaBadge}>
                            <Text style={styles.matriculaText}>{user?.matricula || '---'}</Text>
                        </View>
                    )}
                </View>

                {/* Opciones */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.optionItem} onPress={() => { }}>
                        <View style={[styles.optionIcon, { backgroundColor: '#FED7AA' }]}>
                            <Ionicons name="settings-outline" size={22} color="#ff6a1aff" />
                        </View>
                        <Text style={styles.optionText}>Configuración</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.optionItem} onPress={() => { }}>
                        <View style={[styles.optionIcon, { backgroundColor: '#E5E7EB' }]}>
                            <Ionicons name="help-circle-outline" size={22} color="#4B5563" />
                        </View>
                        <Text style={styles.optionText}>Ayuda y Soporte</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {/* Botón Cerrar Sesión */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versión 1.0.0</Text>
            </View>
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
    content: {
        padding: 20,
        flex: 1,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#ff6a1aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FED7AA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#FFEDD5',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#ff6a1aff',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    userRole: {
        fontSize: 14,
        color: '#78716C',
        marginBottom: 12,
    },
    matriculaBadge: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    matriculaText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6a1aff',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        marginBottom: 24,
        shadowColor: '#ff6a1aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#FFF7ED',
        marginLeft: 60,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#A8A29E',
        fontSize: 12,
    },
});
