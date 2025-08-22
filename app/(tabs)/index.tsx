import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CarouselBanner from '@/components/CarouselBanner';

const { width } = Dimensions.get('window');

interface UserInfo {
    name: string;
    role: string;
    avatar?: string;
}

export default function HomeScreen() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            console.log('📱 Raw userInfo from AsyncStorage:', userInfoStr);

            if (userInfoStr) {
                const user = JSON.parse(userInfoStr);
                console.log('👤 Parsed user info:', user);
                setUserInfo(user);
            } else {
                console.log('⚠️ No userInfo found in AsyncStorage');
            }
        } catch (error) {
            console.error('❌ Error loading user info:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserInfo();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userInfo');
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 17) return 'Chào buổi chiều';
        return 'Chào buổi tối';
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
            id: 'cropseason',
            title: 'Mùa vụ',
            subtitle: 'Quản lý mùa vụ cà phê',
            icon: '🌱',
            color: '#10B981',
            route: '/cropseason' as any,
            roles: ['Farmer', 'Manager'],
        },
        {
            id: 'warehouse',
            title: 'Kho hàng',
            subtitle: 'Quản lý nhập xuất kho',
            icon: '🏭',
            color: '#3B82F6',
            route: '/warehouse' as any,
            roles: ['Farmer', 'Manager', 'Staff'],
        },
        {
            id: 'delivery',
            title: 'Giao hàng',
            subtitle: 'Quản lý đơn hàng giao',
            icon: '🚚',
            color: '#F59E0B',
            route: '/delivery' as any,
            roles: ['DeliveryStaff', 'Manager'],
        },
        {
            id: 'orders',
            title: 'Đơn hàng',
            subtitle: 'Theo dõi trạng thái đơn hàng',
            icon: '📋',
            color: '#8B5CF6',
            route: '/orders' as any,
            roles: ['DeliveryStaff', 'Manager'],
        },
        {
            id: 'progress',
            title: 'Tiến độ',
            subtitle: 'Theo dõi tiến độ sản xuất',
            icon: '📊',
            color: '#F59E0B',
            route: '/progress' as any,
            roles: ['Farmer', 'Manager'],
        },
        {
            id: 'reports',
            title: 'Báo cáo',
            subtitle: 'Xem báo cáo tổng hợp',
            icon: '📈',
            color: '#8B5CF6',
            route: '/reports' as any,
            roles: ['Farmer', 'Manager', 'DeliveryStaff'],
        },
    ];

    // Lọc menu items theo role
    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(userInfo?.role || '')
    );

    // Stats theo role
    const getStatsByRole = () => {
        const role = userInfo?.role || '';

        if (role === 'DeliveryStaff') {
            return [
                { icon: '🚚', number: '8', label: 'Đơn giao' },
                { icon: '✅', number: '5', label: 'Đã giao' },
                { icon: '⏳', number: '3', label: 'Đang giao' },
                { icon: '💰', number: '1.2M', label: 'Doanh thu' },
            ];
        } else if (role === 'Farmer') {
            return [
                { icon: '🌱', number: '3', label: 'Mùa vụ' },
                { icon: '📦', number: '12', label: 'Lô hàng' },
                { icon: '📊', number: '85%', label: 'Tiến độ' },
                { icon: '💰', number: '2.5M', label: 'Doanh thu' },
            ];
        } else {
            // Manager/Staff
            return [
                { icon: '🌱', number: '15', label: 'Mùa vụ' },
                { icon: '📦', number: '48', label: 'Lô hàng' },
                { icon: '🚚', number: '25', label: 'Đơn giao' },
                { icon: '💰', number: '12.5M', label: 'Doanh thu' },
            ];
        }
    };

    const statsData = getStatsByRole();

    // Hoạt động theo role
    const getActivitiesByRole = () => {
        const role = userInfo?.role || '';

        if (role === 'DeliveryStaff') {
            return [
                { icon: '🚚', title: 'Đơn hàng mới được giao', time: '2 giờ trước' },
                { icon: '✅', title: 'Giao hàng thành công', time: '5 giờ trước' },
                { icon: '📱', title: 'Cập nhật trạng thái giao hàng', time: '1 ngày trước' },
            ];
        } else if (role === 'Farmer') {
            return [
                { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
                { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
                { icon: '📊', title: 'Cập nhật tiến độ sản xuất', time: '1 ngày trước' },
            ];
        } else {
            // Manager/Staff
            return [
                { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
                { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
                { icon: '🚚', title: 'Đơn hàng giao mới', time: '1 ngày trước' },
            ];
        }
    };

    const activitiesData = getActivitiesByRole();

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>{userInfo?.name || 'Người dùng'}</Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleLabel}>{getRoleLabel(userInfo?.role || '')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleLogout}>
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
                    </TouchableOpacity>
                </View>
            </View>

            {/* Banner Carousel */}
            <View style={styles.bannerContainer}>
                <CarouselBanner />
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Tổng quan</Text>
                <View style={styles.statsGrid}>
                    {statsData.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statNumber}>{stat.number}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                <View style={styles.menuGrid}>
                    {filteredMenuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { borderLeftColor: item.color }]}
                            onPress={() => router.push(item.route)}
                        >
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.activityContainer}>
                <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
                <View style={styles.activityList}>
                    {activitiesData.map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <Text style={styles.activityEmoji}>{activity.icon}</Text>
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>DakLak Coffee - Chuỗi cung ứng chất lượng</Text>
                <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
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
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    defaultAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FD7622',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    bannerContainer: {
        marginTop: -20,
        marginHorizontal: 24,
        marginBottom: 30,
    },
    statsContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    actionsContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    menuGrid: {
        gap: 12,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    menuArrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    activityContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    activityList: {
        gap: 16,
    },
    activityItem: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityEmoji: {
        fontSize: 20,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    footerSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});
