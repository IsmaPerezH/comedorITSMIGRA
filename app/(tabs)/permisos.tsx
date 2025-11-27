import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
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

export default function PermisosScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { solicitarPermiso, obtenerPermisosPorBeneficiario } = useStorage();

    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        motivo: ''
    });

    const beneficiarioId = user?.role === 'student' ? user.beneficiarioId : '';
    const permisos = beneficiarioId ? obtenerPermisosPorBeneficiario(beneficiarioId) : [];

    // Ordenar permisos por fecha descendente
    const permisosOrdenados = [...permisos].sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    const handleSolicitar = async () => {
        if (!formData.motivo.trim()) {
            Alert.alert('Error', 'Por favor escribe el motivo de tu inasistencia.');
            return;
        }

        try {
            await solicitarPermiso({
                beneficiarioId,
                fecha: formData.fecha,
                motivo: formData.motivo
            });
            setModalVisible(false);
            setFormData({ fecha: new Date().toISOString().split('T')[0], motivo: '' });
            Alert.alert('Éxito', 'Tu solicitud ha sido enviada.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la solicitud.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, fecha: selectedDate.toISOString().split('T')[0] });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprobado': return '#10B981';
            case 'rechazado': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aprobado': return 'checkmark-circle';
            case 'rechazado': return 'close-circle';
            default: return 'time';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header Estilo Admin */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Mis Permisos</Text>
                        <Text style={styles.headerSubtitle}>Solicitudes de inasistencia</Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.iconButton, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="add" size={24} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {permisosOrdenados.length > 0 ? (
                    permisosOrdenados.map((permiso, index) => (
                        <Animated.View
                            key={permiso.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.dateContainer}>
                                    <View style={styles.calendarIcon}>
                                        <Ionicons name="calendar" size={18} color="#6B7280" />
                                    </View>
                                    <Text style={styles.dateText}>
                                        {new Date(permiso.fecha).toLocaleDateString('es-MX', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permiso.estado) + '15' }]}>
                                    <Ionicons name={getStatusIcon(permiso.estado) as any} size={14} color={getStatusColor(permiso.estado)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(permiso.estado) }]}>
                                        {permiso.estado.charAt(0).toUpperCase() + permiso.estado.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.motivoLabel}>Motivo de la solicitud:</Text>
                            <Text style={styles.motivoText}>{permiso.motivo}</Text>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="document-text" size={40} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyTitle}>Sin solicitudes</Text>
                        <Text style={styles.emptySubtitle}>No has solicitado permisos de inasistencia.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal Solicitud */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Solicitar Permiso</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color="#2563EB" style={{ marginTop: 2 }} />
                                <Text style={styles.infoText}>
                                    Puedes solicitar permiso para faltar al comedor.
                                    {'\n'}
                                    <Text style={{ fontWeight: '700', color: '#DC2626' }}>
                                        Nota: No aplica para roles de Aseo o Cocina.
                                    </Text>
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fecha</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                    <Text style={styles.dateButtonText}>
                                        {new Date(formData.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Text>
                                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Motivo</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Explica brevemente por qué no podrás asistir..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    value={formData.motivo}
                                    onChangeText={(t) => setFormData({ ...formData, motivo: t })}
                                />
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSolicitar}>
                                <Text style={styles.submitBtnText}>Enviar Solicitud</Text>
                                <Ionicons name="send" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date(formData.fecha)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}
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
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    calendarIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textTransform: 'capitalize',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 12,
    },
    motivoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    motivoText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 22,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    formContainer: {
        padding: 20,
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 20,
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
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 14,
    },
    dateButtonText: {
        fontSize: 15,
        color: '#1F2937',
        textTransform: 'capitalize',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 14,
        fontSize: 15,
        color: '#1F2937',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
