import BackButton from '@/components/BackButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [loading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => {
                        logout()
                            .then(() => {
                                router.replace('/(auth)/login');
                            })
                            .catch(() => {
                                setError('Không thể đăng xuất');
                            });
                    }
                }
            ]
        );
    };

    const handleEditProfile = () => {
        // Implement edit profile navigation when screen is ready
        Alert.alert('Thông báo', 'Tính năng chỉnh sửa hồ sơ sẽ được phát triển');
    };

    if (loading) {
        return <LoadingSpinner message="Đang xử lý..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={() => setError(null)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <BackButton goBack={() => router.back()} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Thông tin cá nhân</Text>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#FD7622" />
                </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons name="account-circle" size={80} color="#FD7622" />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Tên</Text>
                            <Text style={styles.value}>{user?.name || user?.fullName || 'Chưa cập nhật'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="email" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user?.email || 'Chưa cập nhật'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="phone" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <Text style={styles.value}>{user?.phoneNumber || 'Chưa cập nhật'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Vai trò</Text>
                            <Text style={styles.value}>{user?.role || 'Nông dân'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile/community')}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#FD7622" />
                    <Text style={styles.actionText}>Cộng đồng</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile/legal')}>
                    <MaterialCommunityIcons name="file-document" size={24} color="#FD7622" />
                    <Text style={styles.actionText}>Pháp lý</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
                    <Text style={[styles.actionText, styles.logoutText]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
    },
    profileInfo: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    infoContainer: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    actionsContainer: {
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        gap: 12,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        color: '#EF4444',
    },
});