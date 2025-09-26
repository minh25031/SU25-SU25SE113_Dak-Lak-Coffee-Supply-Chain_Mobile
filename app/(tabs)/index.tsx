import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Animated,
    // Dimensions, // Unused for now
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CarouselBanner from '@/components/CarouselBanner';
import { dashboardAPI, MenuItem, DashboardStats, ActivityItem } from '@/core/api/dashboard.api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SkeletonDashboard from '@/components/SkeletonDashboard';
import { Colors, Spacing, Typography, Components, Animations } from '@/core/constants';


interface UserInfo {
    name: string;
    role: string;
    avatar?: string;
}

// const { width } = Dimensions.get('window'); // Unused for now

export default function HomeScreen() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [stats, setStats] = useState<DashboardStats[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const startAnimations = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: Animations.values.fade.to,
                ...Animations.configs.fadeIn,
            }),
            Animated.timing(slideAnim, {
                toValue: Animations.values.slide.to,
                ...Animations.configs.slideUp,
            }),
            Animated.timing(scaleAnim, {
                toValue: Animations.values.scale.to,
                ...Animations.configs.scale,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim]);

    const loadUserInfo = useCallback(async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');

            if (userInfoStr) {
                const user = JSON.parse(userInfoStr);
                setUserInfo(user);

                // Load dashboard data theo role
                await loadDashboardData(user.role);
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }, []);

    useEffect(() => {
        loadUserInfo();
        startAnimations();
    }, [loadUserInfo, startAnimations]);

    const loadDashboardData = async (role: string) => {
        try {
            setLoading(true);
            // const startTime = Date.now(); // Performance monitoring

            const dashboardData = await dashboardAPI.getDashboardDataOptimized(role);

            // const loadTime = Date.now() - startTime; // Performance monitoring

            setMenuItems(dashboardData.menuItems);
            setStats(dashboardData.stats);
            setActivities(dashboardData.activities);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (userInfo?.role) {
            await loadDashboardData(userInfo.role);
        }
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

    // Lọc menu items theo role (đã được load từ API)
    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(userInfo?.role || '')
    );

    // Hoạt động theo role - sử dụng API thay vì hardcode
    const activitiesData = activities;

    // Hiển thị skeleton loading khi đang tải
    if (loading) {
        return <SkeletonDashboard />;
    }

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Animated.View
                    style={[
                        styles.headerTop,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>{userInfo?.name || 'Người dùng'}</Text>
                        <View style={styles.roleContainer}>
                            <MaterialCommunityIcons name="badge-account" size={Spacing.icon.sm} color={Colors.text.inverse} />
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
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                                style={styles.defaultAvatar}
                            >
                                <Text style={styles.defaultAvatarText}>
                                    {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>



            {/* Banner Carousel */}
            <View style={styles.bannerContainer}>
                <CarouselBanner />
            </View>



            {/* Quick Stats with Animations */}
            <Animated.View
                style={[
                    styles.statsContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                    }
                ]}
            >
                <Text style={styles.sectionTitle}>Tổng quan</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.statCard,
                                {
                                    flex: 1,
                                    marginHorizontal: 4,
                                    transform: [{
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 50],
                                            outputRange: [0, 20 * (index + 1)],
                                        })
                                    }]
                                }
                            ]}
                        >
                            <LinearGradient
                                colors={[Colors.surface, Colors.background]}
                                style={styles.statCardGradient}
                            >
                                <View style={styles.statIconContainer}>
                                    <MaterialCommunityIcons
                                        name={stat.icon as any}
                                        size={Components.statCard.iconSize}
                                        color={Colors.primary}
                                    />
                                </View>
                                <Text style={styles.statNumber}>{stat.number}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </LinearGradient>
                        </Animated.View>
                    ))}
                </View>
            </Animated.View>

            {/* Quick Actions with Enhanced Design */}
            <Animated.View
                style={[
                    styles.actionsContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                <View style={styles.menuGrid}>
                    {filteredMenuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={{
                                transform: [{
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, -20 * (index + 1)],
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.menuItem, { borderLeftColor: item.color }]}
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[Colors.surface, Colors.background]}
                                    style={styles.menuItemGradient}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: `${item.color || Colors.primary}20` }]}>
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={Components.menuItem.iconSize}
                                            color={item.color || Colors.primary}
                                        />
                                    </View>
                                    <View style={styles.menuContent}>
                                        <Text style={styles.menuTitle}>{item.title}</Text>
                                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <View style={styles.menuArrowContainer}>
                                        <MaterialCommunityIcons name="chevron-right" size={Spacing.icon.lg} color={Colors.gray[400]} />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {/* Nút Tư vấn cho Farmer */}
                    {userInfo?.role === 'Farmer' && (
                        <TouchableOpacity
                            style={[styles.menuItem, { borderLeftColor: Colors.success }]}
                            onPress={() => router.push('/farmer-reports')}
                        >
                            <MaterialCommunityIcons
                                name="message-text"
                                size={Spacing.icon.xxl}
                                color={Colors.success}
                                style={styles.menuIcon}
                            />
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>Tư vấn kỹ thuật</Text>
                                <Text style={styles.menuSubtitle}>Gửi báo cáo và nhận tư vấn</Text>
                            </View>
                            <View style={styles.menuArrowContainer}>
                                <MaterialCommunityIcons name="chevron-right" size={Spacing.icon.lg} color={Colors.gray[400]} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* Recent Activities */}
            <View style={styles.activityContainer}>
                <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
                <View style={styles.activityList}>
                    {activitiesData.map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <MaterialCommunityIcons
                                    name={activity.icon as any}
                                    size={Components.activityItem.iconSize}
                                    color={Colors.text.secondary}
                                />
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
                <Text style={styles.footerText}>Dak Lak Coffee Supply Chain</Text>
                <Text style={styles.footerSubtext}>Quản lý chuỗi cung ứng cà phê</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Spacing.sectionMargin,
        minHeight: '100%',
    },
    header: {
        paddingTop: Components.header.paddingTop,
        paddingBottom: Components.header.paddingBottom,
        paddingHorizontal: Components.header.paddingHorizontal,
        borderBottomLeftRadius: Components.header.borderRadius,
        borderBottomRightRadius: Components.header.borderRadius,
        shadowColor: Colors.primary,
        shadowOffset: Spacing.shadow.lg,
        shadowOpacity: 0.3,
        shadowRadius: Spacing.shadow.lg.height,
        elevation: 8,
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
        fontSize: Typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: Spacing.xs,
    },
    userName: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.text.inverse,
        marginBottom: Spacing.sm,
    },
    roleContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Spacing.radius.xl,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    roleLabel: {
        fontSize: Typography.fontSize.sm,
        color: Colors.text.inverse,
        fontWeight: Typography.fontWeight.medium,
    },
    avatarContainer: {
        ...Components.avatar.md,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        ...Components.avatar.md,
    },
    defaultAvatar: {
        ...Components.avatar.md,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultAvatarText: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.text.inverse,
    },

    bannerContainer: {
        marginTop: -20,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sectionMargin,
    },

    statsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sectionMargin,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        borderRadius: Components.statCard.borderRadius,
        shadowColor: '#000',
        shadowOffset: Spacing.shadow.lg,
        shadowOpacity: Components.statCard.shadowOpacity,
        shadowRadius: Components.statCard.shadowRadius,
        elevation: Components.statCard.elevation,
    },
    statCardGradient: {
        padding: Components.statCard.padding,
        borderRadius: Components.statCard.borderRadius,
        alignItems: 'center',
        minHeight: Components.statCard.minHeight,
        justifyContent: 'center',
    },
    statIconContainer: {
        width: Components.statCard.iconContainerSize,
        height: Components.statCard.iconContainerSize,
        borderRadius: Components.statCard.iconContainerSize / 2,
        backgroundColor: `${Colors.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    statIcon: {
        marginBottom: 8,
        alignSelf: 'center',
    },
    statNumber: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: Typography.fontSize.sm,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    actionsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sectionMargin,
    },
    menuGrid: {
        gap: Spacing.md,
    },
    menuItem: {
        borderRadius: Components.menuItem.borderRadius,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: Spacing.shadow.lg,
        shadowOpacity: Components.card.shadowOpacity,
        shadowRadius: Components.card.shadowRadius,
        elevation: Components.card.elevation,
        marginBottom: Spacing.md,
    },
    menuItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Components.menuItem.padding,
        borderRadius: Components.menuItem.borderRadius,
        minHeight: Components.menuItem.minHeight,
    },
    menuIconContainer: {
        width: Components.menuItem.iconContainerSize,
        height: Components.menuItem.iconContainerSize,
        borderRadius: Components.menuItem.iconContainerSize / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    menuSubtitle: {
        fontSize: Typography.fontSize.sm,
        color: Colors.text.secondary,
    },
    menuArrowContainer: {
        width: Spacing.icon.xxl + 6,
        height: Spacing.icon.xxl + 6,
        borderRadius: (Spacing.icon.xxl + 6) / 2,
        backgroundColor: `${Colors.gray[400]}20`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sectionMargin,
    },
    activityList: {
        gap: Spacing.md,
    },
    activityItem: {
        backgroundColor: Colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Components.activityItem.padding,
        borderRadius: Components.activityItem.borderRadius,
        shadowColor: '#000',
        shadowOffset: Spacing.shadow.sm,
        shadowOpacity: 0.05,
        shadowRadius: Spacing.shadow.sm.height,
        elevation: 2,
    },
    activityIcon: {
        width: Components.activityItem.iconContainerSize,
        height: Components.activityItem.iconContainerSize,
        borderRadius: Components.activityItem.iconContainerSize / 2,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.medium,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    activityTime: {
        fontSize: Typography.fontSize.sm,
        color: Colors.text.secondary,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.sectionMargin,
        paddingHorizontal: Spacing.lg,
    },
    footerText: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.medium,
        color: Colors.text.secondary,
        marginBottom: Spacing.sm,
    },
    footerSubtext: {
        fontSize: Typography.fontSize.sm,
        color: Colors.text.disabled,
    },
});
