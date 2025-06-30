import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// Hàm tiện lợi để tạo icon
const createTabIcon = (iconName: keyof typeof MaterialCommunityIcons.glyphMap) => ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name={iconName} color={color} size={size} />
);

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FD7622',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: { fontSize: 13 },
                tabBarStyle: {
                    paddingBottom: 4,
                    height: 60,
                    borderTopWidth: 0.5,
                    borderTopColor: '#ddd',
                    backgroundColor: '#fff',
                },
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: createTabIcon('home'),
                }}
            />
            <Tabs.Screen
                name="support/index"
                options={{
                    title: 'Hỗ trợ',
                    tabBarIcon: createTabIcon('lifebuoy'),
                }}
            />
            <Tabs.Screen
                name="profile/index"
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: createTabIcon('account-circle'),
                }}
            />
        </Tabs>
    );
}
