import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';

import Background from '@/components/Background';
import CarouselBanner from '@/components/CarouselBanner';
import DashboardTile from '@/components/DashboardTile';
import WeatherTicker from '@/components/WeatherTicker';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

// Dashboard menu config
const dashboardItems = [
    { title: 'Mùa vụ của tôi', icon: 'file-document', route: '/plan' },
    { title: 'Mùa vụ cà phê', icon: 'sprout', route: '/season' },
    { title: 'Gửi sự cố mùa vụ', icon: 'alert', route: '/season/issues' },
    { title: 'Ghi nhận thu hoạch', icon: 'clipboard-list', route: '/harvest' },
    { title: 'Quản lý mẻ sơ chế', icon: 'beaker', route: '/processing' },
    { title: 'Phế phẩm sơ chế', icon: 'recycle', route: '/processing/waste' },
    { title: 'Gửi yêu cầu giao hàng', icon: 'truck-delivery', route: '/delivery/request' },
    { title: 'Phản hồi từ chuyên gia', icon: 'chat-question', route: '/expert-reply' },
    { title: 'Trung tâm hỗ trợ', icon: 'lifebuoy', route: '/support' },
];

export default function Dashboard() {
    const router = useRouter();
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const user = useAuthStore((s) => s.user);
    const userName = user?.name || user?.fullName || 'Nông dân';

    return (
        <Background>
            <HeaderRow userName={userName} unreadCount={unreadCount} onPressBell={() => router.push('/notifications')} />
            <CarouselBanner />
            <WeatherTicker />
            <ScrollView contentContainerStyle={styles.grid}>
                {dashboardItems.map((item, index) => (
                    <View style={styles.tileWrapper} key={index}>
                        <DashboardTile
                            title={item.title}
                            icon={item.icon}
                            onPress={() => router.push(item.route as any)}
                        />
                    </View>
                ))}
            </ScrollView>
        </Background>
    );
}

function HeaderRow({ userName, unreadCount, onPressBell }: { userName: string; unreadCount: number; onPressBell: () => void }) {
    return (
        <View style={styles.headerRow}>
            <Text style={styles.greeting}>Chào buổi sáng, {userName}</Text>
            <View style={styles.notificationWrapper}>
                <IconButton icon="bell-outline" containerColor="transparent" onPress={onPressBell} />
                {unreadCount > 0 && (
                    <Badge style={styles.badge}>{unreadCount}</Badge>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    notificationWrapper: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'red',
        color: 'white',
        fontSize: 10,
        zIndex: 1,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginVertical: 8,
        marginRight: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    tileWrapper: {
        width: '48%',
        marginBottom: 12,
    },
});
