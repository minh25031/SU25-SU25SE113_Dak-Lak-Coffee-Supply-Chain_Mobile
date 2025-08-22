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
import { useRouter } from 'expo-router';
import { register } from '@/core/api/auth.api';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = async () => {
        const { fullName, email, password, confirmPassword, phone } = formData;

        if (!fullName || !email || !password || !confirmPassword || !phone) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const response = await register(fullName, email, password, phone);

            if (response.code === 200) {
                Alert.alert(
                    'Đăng ký thành công',
                    'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
                    [
                        {
                            text: 'Đăng nhập',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
            } else {
                Alert.alert('Đăng ký thất bại', response.message);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Đăng ký thất bại');
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/logo.jpg')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={styles.appName}>DakLak Coffee</Text>
                </View>

                {/* Form đăng ký */}
                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
                    <Text style={styles.subtitleText}>Tham gia cùng chúng tôi</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên của bạn"
                            placeholderTextColor="#9CA3AF"
                            value={formData.fullName}
                            onChangeText={(value) => handleInputChange('fullName', value)}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email của bạn"
                            placeholderTextColor="#9CA3AF"
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#9CA3AF"
                            value={formData.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            placeholderTextColor="#9CA3AF"
                            value={formData.password}
                            onChangeText={(value) => handleInputChange('password', value)}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor="#9CA3AF"
                            value={formData.confirmPassword}
                            onChangeText={(value) => handleInputChange('confirmPassword', value)}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.registerButtonText}>
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginLinkText}>
                            Đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập</Text>
                        </Text>
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
        paddingTop: 60,
        paddingBottom: 30,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 60,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonText: {
        fontSize: 20,
        color: '#6B7280',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FD7622',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#FD7622',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
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
        marginBottom: 32,
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
    registerButton: {
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
    registerButtonDisabled: {
        backgroundColor: '#FBBF24',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
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
    loginLink: {
        color: '#FD7622',
        fontSize: 16,
        fontWeight: '600',
    },
    loginLinkText: {
        color: '#6B7280',
        fontSize: 16,
    },
});
