// context/AuthContext.tsx
import { useStorage } from '@/hooks/useStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type User =
    | {
        role: 'student';
        beneficiarioId: string;
        matricula: string;
        nombre: string;
    }
    | { role: 'admin'; username: string };

interface AuthContextProps {
    user: User | null;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { beneficiarios } = useStorage();

    // Persist user in AsyncStorage
    useEffect(() => {
        const loadUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('auth_user');
                if (stored) setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading auth user', e);
            }
        };
        loadUser();
    }, []);

    const persistUser = async (u: User | null) => {
        if (u) await AsyncStorage.setItem('auth_user', JSON.stringify(u));
        else await AsyncStorage.removeItem('auth_user');
    };

    const login = async (identifier: string, password: string) => {
        // Admin shortcut
        if (identifier === 'admin' && password === 'admin123') {
            const adminUser: User = { role: 'admin', username: 'admin' };
            setUser(adminUser);
            await persistUser(adminUser);
            return;
        }

        // Student login: identifier is matricula, password must be a 6‑digit numeric string
        const isSixDigits = /^\d{6}$/.test(password);
        if (!isSixDigits) {
            Alert.alert('Error', 'La contraseña debe ser un número de 6 dígitos');
            return;
        }

        const beneficiario = beneficiarios.find((b) => b.matricula === identifier);
        if (!beneficiario) {
            Alert.alert('Error', 'No se encontró un beneficiario con esa matrícula');
            return;
        }

        const studentUser: User = {
            role: 'student',
            beneficiarioId: beneficiario.id,
            matricula: beneficiario.matricula,
            nombre: beneficiario.nombre,
        };
        setUser(studentUser);
        await persistUser(studentUser);
    };

    const logout = () => {
        setUser(null);
        persistUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
