
import { auth, db } from '@/src/firebase/config';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Extendemos el tipo User para incluir datos personalizados
export type User = FirebaseUser & {
    role?: 'admin' | 'beneficiario' | 'student';
    nombre?: string;
    matricula?: string;
};

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                try {
                    const userDocRef = doc(db, 'beneficiarios', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            ...firebaseUser,
                            role: userData.rol || 'beneficiario',
                            nombre: userData.nombre,
                            matricula: userData.matricula,
                        } as User);
                    } else {
                        // Si no existe documento, asumimos que es un usuario básico o admin manual
                        // Podríamos verificar si el email contiene 'admin' para asignar rol temporalmente
                        const role = firebaseUser.email?.includes('admin') ? 'admin' : 'beneficiario';
                        setUser({
                            ...firebaseUser,
                            role
                        } as User);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(firebaseUser as User);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
