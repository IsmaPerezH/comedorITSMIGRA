// app/(tabs)/permisos.tsx
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

            {/* Header Moderno */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mis Permisos</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                {permisosOrdenados.length > 0 ? (
                    permisosOrdenados.map((permiso, index) => (
                        <Animated.View
                            key={permiso.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.dateContainer}>
                                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                    <Text style={styles.dateText}>
                                        {new Date(permiso.fecha).toLocaleDateString('es-MX', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permiso.estado) + '20' }]}>
                                    <Ionicons name={getStatusIcon(permiso.estado) as any} size={14} color={getStatusColor(permiso.estado)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(permiso.estado) }]}>
                                        {permiso.estado.charAt(0).toUpperCase() + permiso.estado.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.motivoLabel}>Motivo:</Text>
                            <Text style={styles.motivoText}>{permiso.motivo}</Text>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
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
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.infoText}>
                                Puedes solicitar permiso para faltar al comedor (almuerzo, comida o cena).
                                {'\n\n'}
                                <Text style={{ fontWeight: 'bold', color: '#EF4444' }}>
                                    Nota: No aplica para roles de Aseo o Cocina.
                                </Text>
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fecha</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar" size={20} color="#6B7280" />
                                    <Text style={styles.dateButtonText}>{formData.fecha}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Motivo</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Explica brevemente por qué no podrás asistir..."
                                    multiline
                                    numberOfLines={4}
                                    value={formData.motivo}
                                    onChangeText={(t) => setFormData({ ...formData, motivo: t })}
                                />
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSolicitar}>
                                <Text style={styles.submitBtnText}>Enviar Solicitud</Text>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    addButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#2563EB',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    motivoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    motivoText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
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
        padding: 0,
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    formContainer: {
        padding: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 20,
        lineHeight: 20,
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 12,
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
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#1F2937',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
