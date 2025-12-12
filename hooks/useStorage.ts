// hooks/useStorage.ts - Hook de almacenamiento con Firebase
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../src/firebase/config';
import { useNotifications } from './useNotifications';

// Interfaces de datos
export interface Beneficiario {
    id: string; // UID de Firebase Auth
    nombre: string;
    matricula: string;
    email: string;
    activo: boolean;
    rol?: 'admin' | 'beneficiario' | 'student';
}

export interface Asistencia {
    id: string;
    beneficiarioId: string;
    fecha: string;
    hora: string;
    tipo: 'almuerzo' | 'comida' | 'cena';
    comedor: string;
}

export interface Permiso {
    id: string;
    beneficiarioId: string;
    fecha: string;
    motivo: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
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

export const useStorage = () => {
    const [loading, setLoading] = useState(true);
    const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
    const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const { programarRecordatorio, cancelarNotificacion, isExpoGo } = useNotifications();

    // Suscripción a datos en tiempo real
    useEffect(() => {
        const unsubBeneficiarios = onSnapshot(collection(db, 'beneficiarios'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Beneficiario));
            setBeneficiarios(data);
        });

        const unsubAsistencias = onSnapshot(collection(db, 'asistencias'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Asistencia));
            setAsistencias(data);
        });

        const unsubRoles = onSnapshot(collection(db, 'roles'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Rol));
            setRoles(data);
        });

        const unsubPdfs = onSnapshot(collection(db, 'pdfs'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PDFDocument));
            setPdfs(data);
        });

        const unsubPermisos = onSnapshot(collection(db, 'permisos'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Permiso));
            setPermisos(data);
        });

        // Recordatorios locales (opcionalmente podrían ir a Firestore)
        // Por simplicidad, los mantenemos en Firestore también
        const unsubRecordatorios = onSnapshot(collection(db, 'recordatorios'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Recordatorio));
            setRecordatorios(data);
        });

        setLoading(false);

        return () => {
            unsubBeneficiarios();
            unsubAsistencias();
            unsubRoles();
            unsubPdfs();
            unsubPermisos();
            unsubRecordatorios();
        };
    }, []);

    // ---------- Autenticación ----------
    const login = async (email: string, pass: string): Promise<User> => {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        return cred.user;
    };

    const logout = async () => {
        await signOut(auth);
    };

    // ---------- CRUD Beneficiarios ----------
    const agregarBeneficiario = async (datos: { nombre: string; email: string; matricula: string; activo: boolean; password?: string }) => {
        if (!datos.password) throw new Error('Contraseña requerida para crear usuario');

        // 1. Crear usuario en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, datos.email, datos.password);
        const uid = cred.user.uid;

        // 2. Guardar datos en Firestore
        const nuevoBeneficiario: Beneficiario = {
            id: uid,
            nombre: datos.nombre,
            email: datos.email,
            matricula: datos.matricula,
            activo: datos.activo,
            rol: 'student'
        };

        await setDoc(doc(db, 'beneficiarios', uid), nuevoBeneficiario);
        return nuevoBeneficiario;
    };

    const actualizarBeneficiario = async (id: string, datos: Partial<Beneficiario>) => {
        const ref = doc(db, 'beneficiarios', id);
        await updateDoc(ref, datos);
    };

    const eliminarBeneficiario = async (id: string) => {
        // Eliminar de Firestore
        await deleteDoc(doc(db, 'beneficiarios', id));
        // Nota: Eliminar de Auth requiere Cloud Functions o re-autenticación del usuario a eliminar
        Alert.alert('Aviso', 'El usuario fue eliminado de la base de datos. La cuenta de acceso debe ser deshabilitada manualmente en la consola de Firebase.');
    };

    const matriculaExiste = (matricula: string, excludeId?: string): boolean =>
        beneficiarios.some(b => b.matricula === matricula && b.id !== excludeId);

    const emailExiste = (email: string, excludeId?: string): boolean =>
        beneficiarios.some(b => b.email === email && b.id !== excludeId);

    const obtenerBeneficiarioPorId = (id: string): Beneficiario | undefined =>
        beneficiarios.find(b => b.id === id);

    const obtenerBeneficiarioPorMatricula = (matricula: string): Beneficiario | undefined =>
        beneficiarios.find(b => b.matricula === matricula);

    // ---------- CRUD PDFs ----------
    const agregarPDF = async (pdf: Omit<PDFDocument, 'id'>) => {
        await addDoc(collection(db, 'pdfs'), pdf);
    };

    const eliminarPDF = async (id: string) => {
        await deleteDoc(doc(db, 'pdfs', id));
    };

    // ---------- CRUD Roles ----------
    const agregarRol = async (rol: Omit<Rol, 'id'>) => {
        await addDoc(collection(db, 'roles'), rol);
    };

    const actualizarRol = async (id: string, datos: Partial<Rol>) => {
        await updateDoc(doc(db, 'roles', id), datos);
    };

    const eliminarRol = async (id: string) => {
        await deleteDoc(doc(db, 'roles', id));
    };

    // ---------- CRUD Permisos ----------
    const solicitarPermiso = async (permiso: Omit<Permiso, 'id' | 'estado'>) => {
        const nuevo = { ...permiso, estado: 'aprobado' }; // Se auto-aprueban al solicitar
        await addDoc(collection(db, 'permisos'), nuevo);
    };

    const actualizarEstadoPermiso = async (id: string, estado: 'aprobado' | 'rechazado') => {
        await updateDoc(doc(db, 'permisos', id), { estado });
    };

    const obtenerPermisosPorBeneficiario = (beneficiarioId: string) => {
        return permisos.filter(p => p.beneficiarioId === beneficiarioId);
    };

    // ---------- CRUD Asistencias ----------
    const registrarAsistencia = async (beneficiarioId: string, tipo: 'almuerzo' | 'comida' | 'cena') => {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);

        const nueva = {
            beneficiarioId,
            fecha,
            hora,
            tipo,
            comedor: 'Comedor Principal',
        };

        const ref = await addDoc(collection(db, 'asistencias'), nueva);
        return { id: ref.id, ...nueva };
    };

    // ---------- Utilidades ----------

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
        const asistenciasAlmuerzo = asistenciasBeneficiario.filter(a => a.tipo === 'almuerzo').length;
        const asistenciasComida = asistenciasBeneficiario.filter(a => a.tipo === 'comida').length;
        const asistenciasCena = asistenciasBeneficiario.filter(a => a.tipo === 'cena').length;

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
            asistenciasAlmuerzo,
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

    // ---------- CRUD Recordatorios ----------
    const agregarRecordatorio = async (recordatorio: Omit<Recordatorio, 'id'>) => {
        const ref = await addDoc(collection(db, 'recordatorios'), recordatorio);
        const nuevo = { id: ref.id, ...recordatorio };

        if (nuevo.activo) {
            await programarRecordatorio(nuevo.tipo, nuevo.fecha, nuevo.horaRecordatorio);
        }
        return nuevo;
    };

    const actualizarRecordatorio = async (id: string, datos: Partial<Recordatorio>) => {
        await updateDoc(doc(db, 'recordatorios', id), datos);
        // Nota: La reprogramación de notificaciones locales requeriría lógica adicional aquí
    };

    return {
        loading,
        beneficiarios,
        asistencias,
        roles,
        pdfs,
        recordatorios,
        permisos,
        login,
        logout,
        agregarBeneficiario,
        actualizarBeneficiario,
        eliminarBeneficiario,
        matriculaExiste,
        emailExiste,
        agregarRol,
        actualizarRol,
        eliminarRol,
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
        agregarRecordatorio,
        actualizarRecordatorio,
        solicitarPermiso,
        actualizarEstadoPermiso,
        obtenerPermisosPorBeneficiario,
        programarRecordatorio,
        cancelarNotificacion,
        isExpoGo,
    };
};
