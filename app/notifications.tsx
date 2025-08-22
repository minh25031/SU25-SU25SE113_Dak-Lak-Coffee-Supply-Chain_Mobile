import BackButton from '@/components/BackButton';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const notifications = [
    {
        id: 1,
        icon: '🔔',
        title: 'Giá cà phê tăng 5%',
        time: '10 phút trước',
        description: 'Giá Robusta hôm nay tăng nhẹ theo thị trường thế giới.',
    },
    {
        id: 2,
        icon: '📅',
        title: 'Tập huấn kỹ thuật phơi',
        time: '1 giờ trước',
        description: 'Lịch tập huấn sơ chế phơi tĩnh sẽ diễn ra vào ngày 10/06.',
    },
    {
        id: 3,
        icon: '💬',
        title: 'Phản hồi từ chuyên gia',
        time: 'Hôm qua',
        description: 'Chuyên gia đã phản hồi về sự cố sâu bệnh.',
    },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const clear = useNotificationStore((s) => s.clear);

    useEffect(() => {
        clear(); // ✅ chỉ gọi 1 lần khi vào màn hình
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Thông báo</Text>
            <ScrollView>
                {notifications.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconText}>{item.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.description}</Text>
                            <Text style={styles.cardTime}>{item.time}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#111827',
    },
    cardDesc: {
        color: '#4B5563',
        marginTop: 4,
    },
    cardTime: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 6,
    },
});
