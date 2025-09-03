import React, { useState, useEffect, useRef } from 'react';
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
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { register, getBusinessAndFarmerRole } from '@/core/api/auth.api';

interface Role {
    roleId: number;
    roleName: string;
}

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        roleId: 1, // Default to Farmer
        acceptTerms: false,
        // Business-specific fields
        companyName: '',
        taxId: '',
        businessLicenseURL: '',
    });
    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const spinValue = useRef(new Animated.Value(0)).current;

    // Spinning animation effect
    useEffect(() => {
        if (loading) {
            const spinAnimation = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();
        } else {
            spinValue.setValue(0);
        }
    }, [loading]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Fetch roles khi component mount
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setRolesLoading(true);
            const rolesData = await getBusinessAndFarmerRole();
            setRoles(rolesData);

            // Set roleId mặc định là Farmer (tìm role có tên chứa "farmer" hoặc role đầu tiên)
            if (rolesData.length > 0) {
                const farmerRole = rolesData.find(role =>
                    role.roleName.toLowerCase().includes('farmer')
                ) || rolesData[0];
                setFormData(prev => ({ ...prev, roleId: farmerRole.roleId }));
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách vai trò. Vui lòng thử lại.');
        } finally {
            setRolesLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (formData.roleId === 0) {
            newErrors.roleId = 'Vui lòng chọn vai trò';
        }

        // Validate business-specific fields if role is business (assuming roleId 2 is business)
        if (isBusinessRole) {
            if (!formData.companyName.trim()) {
                newErrors.companyName = 'Vui lòng nhập tên công ty';
            }
            if (!formData.taxId.trim()) {
                newErrors.taxId = 'Vui lòng nhập mã số thuế';
            } else if (!/^\d{10,14}$/.test(formData.taxId)) {
                newErrors.taxId = 'Mã số thuế phải từ 10 đến 14 chữ số';
            }
            if (!formData.businessLicenseURL.trim()) {
                newErrors.businessLicenseURL = 'Vui lòng nhập đường dẫn giấy phép kinh doanh';
            }
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Bạn phải đồng ý với các điều khoản';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await register(
                formData.fullName,
                formData.email,
                formData.password,
                formData.phone,
                formData.roleId,
                formData.companyName,
                formData.taxId,
                formData.businessLicenseURL
            );

            // Backend returns user data directly on success, no 'code' field
            if (response && response.userId) {
                Alert.alert(
                    'Đăng ký thành công',
                    'Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email để xác thực.',
                    [
                        {
                            text: 'Đăng nhập',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
            } else {
                Alert.alert('Đăng ký thất bại', 'Có lỗi xảy ra khi tạo tài khoản');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Đăng ký thất bại';

            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
            } else if (error.response?.status === 409) {
                errorMessage = 'Email đã tồn tại trong hệ thống';
            } else if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra internet';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Lỗi đăng ký', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Function để chuyển đổi tên role sang tiếng Việt
    const getRoleDisplayName = (roleName: string) => {
        const lowerRoleName = roleName.toLowerCase();
        if (lowerRoleName.includes('farmer')) {
            return '🌾 Nông hộ';
        } else if (lowerRoleName.includes('business') || lowerRoleName.includes('manager') || lowerRoleName.includes('buyer')) {
            return '🏢 Doanh nghiệp';
        }
        return roleName; // Fallback về tên gốc nếu không match
    };

    // Kiểm tra role có phải là Business không
    const selectedRole = roles.find(role => role.roleId === formData.roleId);
    const isBusinessRole = selectedRole && (
        selectedRole.roleName.toLowerCase().includes('business') ||
        selectedRole.roleName.toLowerCase().includes('manager') ||
        selectedRole.roleName.toLowerCase().includes('buyer')
    );

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
                        <Ionicons name="arrow-back" size={24} color="#6B7280" />
                    </TouchableOpacity>

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

                {/* Form đăng ký */}
                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
                    <Text style={styles.subtitleText}>Tham gia cùng chúng tôi</Text>

                    {/* Role Selection */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Vai trò *</Text>
                        <TouchableOpacity
                            style={styles.roleSelector}
                            onPress={() => {
                                if (roles.length > 0) {
                                    Alert.alert(
                                        'Chọn vai trò',
                                        'Chọn vai trò của bạn:',
                                        roles.map(role => ({
                                            text: getRoleDisplayName(role.roleName),
                                            onPress: () => {
                                                handleInputChange('roleId', role.roleId);
                                            },
                                        }))
                                    );
                                }
                            }}
                        >
                            <Text style={[
                                styles.roleSelectorText,
                                formData.roleId === 0 && styles.roleSelectorPlaceholder
                            ]}>
                                {formData.roleId > 0
                                    ? getRoleDisplayName(selectedRole?.roleName || '')
                                    : 'Chọn vai trò của bạn'
                                }
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        {errors.roleId && <Text style={styles.errorText}>{errors.roleId}</Text>}
                        {rolesLoading && (
                            <Text style={styles.loadingText}>
                                Đang tải danh sách vai trò...
                            </Text>
                        )}
                    </View>

                    {/* Full Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Họ và tên *</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập họ tên của bạn"
                                placeholderTextColor="#9CA3AF"
                                value={formData.fullName}
                                onChangeText={(value) => handleInputChange('fullName', value)}
                            />
                        </View>
                        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
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
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Phone Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Số điện thoại *</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor="#9CA3AF"
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    {/* Business-specific fields - only show for business role */}
                    {isBusinessRole && (
                        <>
                            {/* Company Name Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Tên công ty *</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="business-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập tên công ty"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.companyName}
                                        onChangeText={(value) => handleInputChange('companyName', value)}
                                    />
                                </View>
                                {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
                            </View>

                            {/* Tax ID Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Mã số thuế *</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mã số thuế (10-14 chữ số)"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.taxId}
                                        onChangeText={(value) => handleInputChange('taxId', value)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                {errors.taxId && <Text style={styles.errorText}>{errors.taxId}</Text>}
                            </View>

                            {/* Business License URL Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Đường dẫn giấy phép kinh doanh *</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="link-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập đường dẫn giấy phép kinh doanh"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.businessLicenseURL}
                                        onChangeText={(value) => handleInputChange('businessLicenseURL', value)}
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.businessLicenseURL && <Text style={styles.errorText}>{errors.businessLicenseURL}</Text>}
                            </View>
                        </>
                    )}

                    {/* Password Fields */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mật khẩu *</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Xác nhận mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    {/* Terms & Conditions */}
                    <View style={styles.termsContainer}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                        >
                            <View style={[
                                styles.checkbox,
                                formData.acceptTerms && styles.checkboxChecked
                            ]}>
                                {formData.acceptTerms && (
                                    <Ionicons name="checkmark" size={16} color="white" />
                                )}
                            </View>
                            <Text style={styles.termsText}>
                                Tôi đồng ý với các{' '}
                                <Text style={styles.termsLink}>điều khoản của nền tảng</Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Ionicons name="reload" size={20} color="white" style={{ marginRight: 10 }} />
                                </Animated.View>
                                <Text style={styles.registerButtonText}>Đang xử lý...</Text>
                            </View>
                        ) : (
                            <Text style={styles.registerButtonText}>Đăng ký tài khoản</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginLinkText}>
                            Đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
    appSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
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
        flex: 1, // Thêm flex: 1 để sử dụng hết width
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    inputIcon: {
        marginRight: 12,
        width: 20, // Cố định width icon
        textAlign: 'center', // Căn giữa icon
    },
    passwordInput: {
        flex: 1, // Sử dụng hết width còn lại
        paddingRight: 10, // Adjust for eye button
        fontSize: 16,
        color: '#1F2937',
    },
    eyeButton: {
        padding: 8,
        width: 36, // Cố định width button
        alignItems: 'center', // Căn giữa icon
    },
    roleSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    roleSelectorText: {
        flex: 1, // Sử dụng hết width có sẵn
        fontSize: 16,
        color: '#374151',
    },
    roleSelectorPlaceholder: {
        color: '#9CA3AF',
    },
    termsContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#FD7622',
        borderColor: '#FD7622',
    },
    termsText: {
        fontSize: 14,
        color: '#6B7280',
        flexShrink: 1,
    },
    termsLink: {
        color: '#FD7622',
        fontSize: 14,
        fontWeight: '600',
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 5,
    },
    loadingText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
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