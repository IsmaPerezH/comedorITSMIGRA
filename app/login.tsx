// app/login.tsx
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [matricula, setMatricula] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') router.replace('/admin');
            else router.replace('/(tabs)/mi-qr');
        }
    }, [user]);

    const handleLogin = async () => {
        if (!matricula || !password) {
            Alert.alert('Error', 'Completa matrícula y contraseña');
            return;
        }
        setLoading(true);
        try {
            await login(matricula, password);
            // navigation handled by useEffect
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput
                placeholder="Matrícula"
                value={matricula}
                onChangeText={setMatricula}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="default"
            />
            <TextInput
                placeholder="Contraseña (6 dígitos)"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                keyboardType="default"
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a237e',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        color: 'white',
        marginBottom: 30,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
