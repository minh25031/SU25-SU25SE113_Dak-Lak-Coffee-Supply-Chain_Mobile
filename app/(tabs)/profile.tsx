import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UserInfo {
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export default function ProfileScreen() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const user = JSON.parse(userInfoStr);
                setUserInfo(user);
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('authToken');
                            await AsyncStorage.removeItem('userInfo');
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Error logging out:', error);
                        }
                    },
                },
            ]
        );
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'Farmer':
                return 'Nông dân';
            case 'Manager':
                return 'Quản lý';
            case 'Staff':
                return 'Nhân viên';
            case 'DeliveryStaff':
                return 'Nhân viên giao hàng';
            default:
                return role;
        }
    };

    const menuItems = [
        {
            id: 'account',
            title: 'Thông tin tài khoản',
            subtitle: 'Cập nhật thông tin cá nhân',
            icon: 'account',
            onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
            id: 'security',
            title: 'Bảo mật',
            subtitle: 'Đổi mật khẩu, xác thực 2 yếu tố',
            icon: 'lock',
            onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
            id: 'notifications',
            title: 'Thông báo',
            subtitle: 'Cài đặt thông báo',
            icon: 'bell',
            onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
            id: 'help',
            title: 'Trợ giúp & Hỗ trợ',
            subtitle: 'Hướng dẫn sử dụng, liên hệ hỗ trợ',
            icon: 'help-circle',
            onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
            id: 'about',
            title: 'Về ứng dụng',
            subtitle: 'Phiên bản, thông tin phát triển',
            icon: 'information',
            onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        {userInfo?.avatar ? (
                            <Image
                                source={{ uri: userInfo.avatar }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.defaultAvatar}>
                                <Text style={styles.defaultAvatarText}>
                                    {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userInfo?.name || 'Người dùng'}</Text>
                        <Text style={styles.userEmail}>{userInfo?.email || 'email@example.com'}</Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleLabel}>{getRoleLabel(userInfo?.role || '')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <MaterialCommunityIcons
                            name={item.icon as any}
                            size={24}
                            color="#FD7622"
                            style={styles.menuIcon}
                        />
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons
                        name="logout"
                        size={20}
                        color="#FFFFFF"
                        style={styles.logoutIcon}
                    />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.appInfoContainer}>
                <Text style={styles.appName}>DakLak Coffee</Text>
                <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
                <Text style={styles.appDescription}>
                    Ứng dụng quản lý chuỗi cung ứng cà phê DakLak
                </Text>
                <Text style={styles.copyright}>© 2025 All rights reserved</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4',
    },
    header: {
        backgroundColor: '#FD7622',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    defaultAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultAvatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FD7622',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 8,
    },
    roleContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    roleLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    menuContainer: {
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 20,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    menuArrow: {
        fontSize: 18,
        color: '#9CA3AF',
    },
    logoutContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    appInfoContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 24,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    appVersion: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    appDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    copyright: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
