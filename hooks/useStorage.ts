// hooks/useStorage.ts - Hook de almacenamiento con gestión completa
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNotifications } from './useNotifications';

// Interfaces de datos
export interface Beneficiario {
    id: string;
    nombre: string;
    matricula: string;
    activo: boolean;
    password: string;
}

export interface Asistencia {
    id: string;
    beneficiarioId: string;
    fecha: string;
    hora: string;
    tipo: 'comida' | 'cena';
    comedor: string;
}

export interface Rol {
    id: string;
    beneficiarioId: string;
    tipo: 'cocina' | 'aseo';
    fecha: string;
    horario: string;
    estado: 'pendiente' | 'completado' | 'proximo';
    descripcion: string;
    compañeros: string[];
}

export interface PDFDocument {
    id: string;
    titulo: string;
    tipo: 'cocina' | 'aseo' | 'general';
    fecha: string;
    url: string;
    descripcion: string;
    tamaño: number;
}

export interface Recordatorio {
    id: string;
    beneficiarioId: string;
    tipo: 'cocina' | 'aseo';
    fecha: string;
    activo: boolean;
    horaRecordatorio: string;
}

// Claves para AsyncStorage
const STORAGE_KEYS = {
    BENEFICIARIOS: 'beneficiarios',
    ASISTENCIAS: 'asistencias',
    ROLES: 'roles',
    PDFS: 'pdfs',
    RECORDATORIOS: 'recordatorios',
};

// Generador de contraseña de 6 dígitos
const generarPassword6 = (): string => {
    const num = Math.floor(Math.random() * 1_000_000);
    return num.toString().padStart(6, '0');
};

// Datos iniciales (para demo)
const DATOS_INICIALES = {
    beneficiarios: [
        { id: '1', nombre: 'Brenda Vásquez Cruz', matricula: '22105081', activo: true, password: generarPassword6() },
        { id: '2', nombre: 'Ismael Hernández Pérez', matricula: '22105082', activo: true, password: generarPassword6() },
        { id: '3', nombre: 'José Adrián Cruz Cuevas', matricula: '22105083', activo: true, password: generarPassword6() },
        { id: '4', nombre: 'Ana García López', matricula: '22105084', activo: true, password: generarPassword6() },
        { id: '5', nombre: 'Carlos Ruiz Martínez', matricula: '22105085', activo: true, password: generarPassword6() },
    ] as Beneficiario[],
    asistencias: [
        { id: '1', beneficiarioId: '1', fecha: '2025-11-25', hora: '14:30', tipo: 'comida', comedor: 'Comedor Principal' },
        { id: '2', beneficiarioId: '2', fecha: '2025-11-25', hora: '14:25', tipo: 'comida', comedor: 'Comedor Principal' },
        { id: '3', beneficiarioId: '1', fecha: '2025-11-24', hora: '14:40', tipo: 'comida', comedor: 'Comedor Principal' },
        { id: '4', beneficiarioId: '3', fecha: '2025-11-24', hora: '14:35', tipo: 'comida', comedor: 'Comedor Principal' },
    ] as Asistencia[],
    roles: [
        {
            id: '1',
            beneficiarioId: '1',
            tipo: 'cocina',
            fecha: '2025-11-28',
            horario: '07:00 - 10:00',
            estado: 'proximo',
            descripcion: 'Preparación desayuno',
            compañeros: ['Ismael Hernández', 'Carlos Ruiz'],
        },
        {
            id: '2',
            beneficiarioId: '2',
            tipo: 'aseo',
            fecha: '2025-11-25',
            horario: '14:00 - 16:00',
            estado: 'pendiente',
            descripcion: 'Limpieza comedor',
            compañeros: ['Ana García'],
        },
        {
            id: '3',
            beneficiarioId: '1',
            tipo: 'cocina',
            fecha: '2025-11-22',
            horario: '07:00 - 10:00',
            estado: 'completado',
            descripcion: 'Preparación desayuno',
            compañeros: ['María López', 'Pedro Martínez'],
        },
        {
            id: '4',
            beneficiarioId: '3',
            tipo: 'aseo',
            fecha: '2025-11-20',
            horario: '14:00 - 16:00',
            estado: 'completado',
            descripcion: 'Limpieza áreas comunes',
            compañeros: ['Juan Pérez'],
        },
    ] as Rol[],
    pdfs: [
        {
            id: '1',
            titulo: 'Rool de Cocina Noviembre 2025',
            tipo: 'cocina',
            fecha: '2025-11-01',
            url: 'https://ejemplo.com/rool-cocina-nov.pdf',
            descripcion: 'Turnos de cocina para el mes de noviembre',
            tamaño: 1024 * 1024,
        },
        {
            id: '2',
            titulo: 'Rool de Aseo Noviembre 2025',
            tipo: 'aseo',
            fecha: '2025-11-01',
            url: 'https://ejemplo.com/rool-aseo-nov.pdf',
            descripcion: 'Turnos de aseo para el mes de noviembre',
            tamaño: 1024 * 1024,
        },
    ] as PDFDocument[],
    recordatorios: [] as Recordatorio[],
};

export const useStorage = () => {
    const [loading, setLoading] = useState(true);
    const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
    const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
    const { programarRecordatorio, cancelarNotificacion, isExpoGo } = useNotifications();

    // Cargar datos una sola vez al montar el hook
    useEffect(() => {
        inicializarDatos();
    }, []);

    // ---------- CRUD Beneficiarios ----------
    const agregarBeneficiario = async (beneficiario: Omit<Beneficiario, 'id'> | Omit<Beneficiario, 'id' | 'password'>) => {
        // Si no se proporciona password, generar uno automáticamente
        const password = 'password' in beneficiario && beneficiario.password ? beneficiario.password : generarPassword6();
        const nuevo: Beneficiario = {
            ...beneficiario,
            id: Date.now().toString(),
            password
        };
        const nuevos = [...beneficiarios, nuevo];
        setBeneficiarios(nuevos);
        await AsyncStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(nuevos));

        // Solo mostrar alerta si se generó automáticamente
        if (!('password' in beneficiario) || !beneficiario.password) {
            Alert.alert('Beneficiario creado', `Matrícula: ${nuevo.matricula}\nContraseña: ${password}`);
        }
        return nuevo;
    };

    const actualizarBeneficiario = async (id: string, datosActualizados: Partial<Beneficiario>) => {
        const actualizados = beneficiarios.map(b => (b.id === id ? { ...b, ...datosActualizados } : b));
        setBeneficiarios(actualizados);
        await AsyncStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(actualizados));
    };

    const eliminarBeneficiario = async (id: string) => {
        const filtrados = beneficiarios.filter(b => b.id !== id);
        setBeneficiarios(filtrados);
        await AsyncStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(filtrados));
    };

    const matriculaExiste = (matricula: string, excludeId?: string): boolean =>
        beneficiarios.some(b => b.matricula === matricula && b.id !== excludeId);

    // ---------- CRUD PDFs ----------
    const agregarPDF = async (pdf: Omit<PDFDocument, 'id'>) => {
        const nuevo: PDFDocument = { ...pdf, id: Date.now().toString() };
        const nuevos = [...pdfs, nuevo];
        setPdfs(nuevos);
        await AsyncStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(nuevos));
        return nuevo;
    };

    const eliminarPDF = async (id: string) => {
        const filtrados = pdfs.filter(p => p.id !== id);
        setPdfs(filtrados);
        await AsyncStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(filtrados));
    };

    // ---------- CRUD Asistencias ----------
    const registrarAsistencia = async (beneficiarioId: string, tipo: 'comida' | 'cena') => {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);

        const nueva: Asistencia = {
            id: Date.now().toString(),
            beneficiarioId,
            fecha,
            hora,
            tipo,
            comedor: 'Comedor Principal',
        };

        const nuevas = [...asistencias, nueva];
        setAsistencias(nuevas);
        await AsyncStorage.setItem(STORAGE_KEYS.ASISTENCIAS, JSON.stringify(nuevas));
        return nueva;
    };

    // ---------- Utilidades ----------
    const obtenerBeneficiarioPorMatricula = (mat: string) => beneficiarios.find(b => b.matricula === mat);
    const obtenerBeneficiarioPorId = (id: string) => beneficiarios.find(b => b.id === id);

    const obtenerAsistenciasDelDia = () => {
        const hoy = new Date().toISOString().split('T')[0];
        return asistencias.filter(a => a.fecha === hoy);
    };

    const obtenerAsistenciasPorBeneficiario = (beneficiarioId: string) => {
        return asistencias.filter(a => a.beneficiarioId === beneficiarioId);
    };

    const obtenerEstadisticasCompletas = (beneficiarioId: string) => {
        const asistenciasBeneficiario = asistencias.filter(a => a.beneficiarioId === beneficiarioId);
        const totalAsistencias = asistenciasBeneficiario.length;
        const asistenciasComida = asistenciasBeneficiario.filter(a => a.tipo === 'comida').length;
        const asistenciasCena = asistenciasBeneficiario.filter(a => a.tipo === 'cena').length;

        // Calcular racha actual (días consecutivos)
        const fechasOrdenadas = [...new Set(asistenciasBeneficiario.map(a => a.fecha))].sort().reverse();
        let rachaActual = 0;
        const hoy = new Date();

        for (let i = 0; i < fechasOrdenadas.length; i++) {
            const fechaAsistencia = new Date(fechasOrdenadas[i]);
            const diferenciaDias = Math.floor((hoy.getTime() - fechaAsistencia.getTime()) / (1000 * 60 * 60 * 24));

            if (diferenciaDias === i) {
                rachaActual++;
            } else {
                break;
            }
        }

        return {
            totalAsistencias,
            asistenciasComida,
            asistenciasCena,
            rachaActual,
            ultimaAsistencia: asistenciasBeneficiario.length > 0
                ? asistenciasBeneficiario.sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
                : null,
        };
    };

    const obtenerPDFsPorTipo = (tipo: 'cocina' | 'aseo' | 'general') => {
        return pdfs.filter(p => p.tipo === tipo);
    };

    const obtenerRecordatoriosPorBeneficiario = (beneficiarioId: string) => {
        return recordatorios.filter(r => r.beneficiarioId === beneficiarioId);
    };

    // ---------- Función de desarrollo para limpiar datos ----------
    const limpiarDatos = async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.BENEFICIARIOS,
                STORAGE_KEYS.ASISTENCIAS,
                STORAGE_KEYS.ROLES,
                STORAGE_KEYS.PDFS,
                STORAGE_KEYS.RECORDATORIOS,
            ]);
            setBeneficiarios([]);
            setAsistencias([]);
            setRoles([]);
            setPdfs([]);
            setRecordatorios([]);
        } catch (e) {
            console.error('Error limpiando datos:', e);
        }
    };

    // ---------- Inicialización de datos ----------
    const inicializarDatos = async () => {
        try {
            const existentes = await AsyncStorage.getItem(STORAGE_KEYS.BENEFICIARIOS);
            if (!existentes) {
                await Promise.all([
                    AsyncStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(DATOS_INICIALES.beneficiarios)),
                    AsyncStorage.setItem(STORAGE_KEYS.ASISTENCIAS, JSON.stringify(DATOS_INICIALES.asistencias)),
                    AsyncStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(DATOS_INICIALES.roles)),
                    AsyncStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(DATOS_INICIALES.pdfs)),
                    AsyncStorage.setItem(STORAGE_KEYS.RECORDATORIOS, JSON.stringify(DATOS_INICIALES.recordatorios)),
                ]);
            }
            await cargarDatos();
        } catch (e) {
            console.error('Error inicializando datos:', e);
        } finally {
            setLoading(false);
        }
    };

    const cargarDatos = async () => {
        try {
            const [benefData, asistData, rolData, pdfData, recData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.BENEFICIARIOS),
                AsyncStorage.getItem(STORAGE_KEYS.ASISTENCIAS),
                AsyncStorage.getItem(STORAGE_KEYS.ROLES),
                AsyncStorage.getItem(STORAGE_KEYS.PDFS),
                AsyncStorage.getItem(STORAGE_KEYS.RECORDATORIOS),
            ]);
            if (benefData) setBeneficiarios(JSON.parse(benefData));
            if (asistData) setAsistencias(JSON.parse(asistData));
            if (rolData) setRoles(JSON.parse(rolData));
            if (pdfData) setPdfs(JSON.parse(pdfData));
            if (recData) setRecordatorios(JSON.parse(recData));
        } catch (e) {
            console.error('Error cargando datos:', e);
        }
    };

    // ---------- Exportar API ----------
    return {
        loading,
        beneficiarios,
        asistencias,
        roles,
        pdfs,
        recordatorios,
        agregarBeneficiario,
        actualizarBeneficiario,
        eliminarBeneficiario,
        matriculaExiste,
        agregarPDF,
        eliminarPDF,
        registrarAsistencia,
        obtenerBeneficiarioPorMatricula,
        obtenerBeneficiarioPorId,
        obtenerAsistenciasDelDia,
        obtenerAsistenciasPorBeneficiario,
        obtenerEstadisticasCompletas,
        obtenerPDFsPorTipo,
        obtenerRecordatoriosPorBeneficiario,
        limpiarDatos,
        programarRecordatorio,
        cancelarNotificacion,
        isExpoGo,
    };
};