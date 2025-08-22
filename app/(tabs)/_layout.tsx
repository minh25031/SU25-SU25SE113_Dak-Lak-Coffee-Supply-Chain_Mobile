import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#FD7622',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={[styles.tabIconText, { color, fontSize: size }]}>🏠</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="cropseason"
                options={{
                    title: 'Mùa vụ',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={[styles.tabIconText, { color, fontSize: size }]}>🌱</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="warehouse"
                options={{
                    title: 'Kho hàng',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={[styles.tabIconText, { color, fontSize: size }]}>🏭</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={[styles.tabIconText, { color, fontSize: size }]}>👤</Text>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        paddingBottom: 8,
        height: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    tabIcon: {
        marginTop: 4,
    },
    tabIconText: {
        textAlign: 'center',
    },
});
