import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
    const handleContactPress = (type: string, value: string) => {
        if (type === 'email') {
            Linking.openURL(`mailto:${value}`);
        } else if (type === 'phone') {
            Linking.openURL(`tel:${value}`);
        }
    };

    const handleFAQPress = (question: string) => {
        Alert.alert('Câu hỏi thường gặp', question, [
            { text: 'Đóng', style: 'cancel' }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🆘 Trung tâm hỗ trợ</Text>
                    <Text style={styles.subtitle}>Chúng tôi luôn sẵn sàng hỗ trợ bạn</Text>
                </View>

                {/* Liên hệ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📞 Liên hệ với chúng tôi</Text>

                    <TouchableOpacity
                        style={[styles.card, styles.contactCard]}
                        onPress={() => handleContactPress('email', 'support@daklakcoffee.vn')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>📧</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Email hỗ trợ</Text>
                            <Text style={styles.cardSubtitle}>support@daklakcoffee.vn</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, styles.contactCard]}
                        onPress={() => handleContactPress('phone', '+84901234567')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>📱</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Hotline</Text>
                            <Text style={styles.cardSubtitle}>0901 234 567</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Hướng dẫn */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📚 Hướng dẫn sử dụng</Text>

                    <TouchableOpacity style={styles.card}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>📖</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Tài liệu hướng dẫn</Text>
                            <Text style={styles.cardSubtitle}>Xem hướng dẫn chi tiết</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>🎥</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Video hướng dẫn</Text>
                            <Text style={styles.cardSubtitle}>Học qua video trực quan</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>❓ Câu hỏi thường gặp</Text>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleFAQPress('Để đặt lại mật khẩu, vui lòng nhấn "Quên mật khẩu" ở màn hình đăng nhập và làm theo hướng dẫn.')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>🔐</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Tôi quên mật khẩu?</Text>
                            <Text style={styles.cardSubtitle}>Cách khôi phục mật khẩu</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleFAQPress('Vào mục "Hồ sơ" trong tab điều hướng, sau đó chọn "Chỉnh sửa thông tin" để cập nhật hồ sơ của bạn.')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>👤</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Chỉnh sửa hồ sơ</Text>
                            <Text style={styles.cardSubtitle}>Cập nhật thông tin cá nhân</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleFAQPress('Bạn có thể tạo mùa vụ mới trong mục "Mùa vụ", nhập đầy đủ thông tin và chọn "Lưu" để hoàn tất.')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>🌱</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Tạo mùa vụ mới</Text>
                            <Text style={styles.cardSubtitle}>Hướng dẫn quản lý mùa vụ</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Thông tin ứng dụng */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>DakLak Coffee v1.0.0</Text>
                    <Text style={styles.footerSubtext}>© 2025 DakLak Coffee Supply Chain</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    contactCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    arrow: {
        fontSize: 20,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});
