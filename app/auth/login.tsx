import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import Background from '../../components/Background';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Logo from '../../components/Logo';
import TextInput from '../../components/TextInput';
import { loginFarmer } from '../../core/api/auth.api';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [loading, setLoading] = useState(false);

    const validate = () => {
        let valid = true;
        if (!email.value.includes('@')) {
            setEmail({ ...email, error: 'Email không hợp lệ' });
            valid = false;
        }
        if (password.value.length < 6) {
            setPassword({ ...password, error: 'Mật khẩu phải từ 6 ký tự' });
            valid = false;
        }
        return valid;
    };

    const onLoginPressed = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const token = await loginFarmer(email.value, password.value);
            await useAuthStore.getState().setToken(token);

            const user = useAuthStore.getState().user;
            if (user?.role !== 'Farmer') {
                await useAuthStore.getState().logout();
                Alert.alert('Không hợp lệ', 'Chỉ tài khoản Farmer mới được truy cập.');
                return;
            }

            setTimeout(() => {
                router.replace('/(tabs)/home');
            }, 0);
        } catch (error) {
            console.error('Login failed:', error);
            Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <Background>
                    <Logo />
                    <Header text="Đăng nhập Farmer" />

                    <TextInput
                        label="Email"
                        returnKeyType="next"
                        value={email.value}
                        onChangeText={(text: string) => setEmail({ value: text, error: '' })}
                        error={!!email.error}
                        errorText={email.error}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        label="Mật khẩu"
                        returnKeyType="done"
                        value={password.value}
                        onChangeText={(text: string) => setPassword({ value: text, error: '' })}
                        error={!!password.error}
                        errorText={password.error}
                        secureTextEntry
                    />

                    <View style={styles.forgotPassword}>
                        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                            <Text style={styles.link}>Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    </View>

                    <Button mode="contained" onPress={onLoginPressed} loading={loading}>
                        Đăng nhập
                    </Button>

                    <View style={styles.row}>
                        <Text style={styles.label}>Bạn chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text style={styles.link}>Đăng ký</Text>
                        </TouchableOpacity>
                    </View>
                </Background>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    forgotPassword: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        marginTop: 4,
    },
    label: {
        color: '#6B7280',
    },
    link: {
        fontWeight: 'bold',
        color: '#FD7622', // dùng màu cam chủ đạo
    },
});
