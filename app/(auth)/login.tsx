import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '@/core/api/auth.api';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }



        setLoading(true);
        try {
            const response = await login(email, password);

            // Kiểm tra nếu response là JWT token string
            if (typeof response === 'string' && response.length > 0) {
                // Response là JWT token trực tiếp
                await AsyncStorage.setItem('authToken', response);

                // Decode JWT để lấy thông tin user
                try {
                    const base64Url = response.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const decoded = JSON.parse(jsonPayload);

                    const userInfo = {
                        name: decoded.name || decoded.fullName || 'Người dùng',
                        email: decoded.email || email,
                        role: decoded.role || 'Farmer',
                        avatar: decoded.profilePictureUrl || decoded.avatar || ''
                    };
                    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

                    router.replace('/(tabs)');
                } catch (decodeError) {
                    console.error('❌ JWT decode error:', decodeError);
                    Alert.alert('Lỗi', 'Không thể giải mã token');
                }
            } else if (response && response.token) {
                // Nếu response có cấu trúc object với token
                await AsyncStorage.setItem('authToken', response.token);

                const userInfo = {
                    name: response.fullName || response.name || 'Người dùng',
                    email: email,
                    role: response.role || 'Farmer',
                    avatar: response.profilePictureUrl || response.avatar || ''
                };

                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

                router.replace('/(tabs)');
            } else if (response && response.data && response.data.token) {
                // Nếu response có cấu trúc {data: {...}}
                await AsyncStorage.setItem('authToken', response.data.token);

                const userInfo = {
                    name: response.data.fullName || response.data.name || 'Người dùng',
                    email: email,
                    role: response.data.role || 'Farmer',
                    avatar: response.data.profilePictureUrl || response.data.avatar || ''
                };

                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

                router.replace('/(tabs)');
            } else {
                Alert.alert('Đăng nhập thất bại', 'Cấu trúc dữ liệu không hợp lệ');
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);

            let errorMessage = 'Đăng nhập thất bại';

            if (error.response?.status === 401) {
                errorMessage = 'Email hoặc mật khẩu không đúng';
            } else if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra internet';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Lỗi đăng nhập', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header với logo và tên app */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/logo.jpg')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={styles.appName}>DakLak Coffee</Text>
                    <Text style={styles.appSubtitle}>Chuỗi cung ứng cà phê chất lượng</Text>
                </View>

                {/* Form đăng nhập */}
                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Chào mừng bạn trở lại!</Text>
                    <Text style={styles.subtitleText}>Đăng nhập để tiếp tục</Text>



                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email của bạn"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mật khẩu</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                    >
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>


                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.registerLink}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FD7622',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#FD7622',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    appSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        paddingTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },

    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    loginButton: {
        backgroundColor: '#FD7622',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#FD7622',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonDisabled: {
        backgroundColor: '#FBBF24',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        color: '#FD7622',
        fontSize: 16,
        fontWeight: '500',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 16,
    },
    registerLink: {
        color: '#FD7622',
        fontSize: 16,
        fontWeight: '600',
    },
});
