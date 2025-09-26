import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/constants';

export default function TabLayout() {
    const [userRole, setUserRole] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Force re-render
    const appState = useRef(AppState.currentState);
    const lastRoleRef = useRef<string>('');

    // Reload khi tab được focus
    useFocusEffect(
        React.useCallback(() => {
            loadUserRole();
        }, [])
    );

    // Reload khi component mount
    useEffect(() => {
        loadUserRole();

        // Listener cho app state changes (chỉ khi app trở nên active)
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                loadUserRole();
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, []);

    const loadUserRole = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');

            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);

                const newRole = userInfo.role || 'Farmer';
                // Force update role nếu khác với current state
                if (newRole !== userRole) {
                    lastRoleRef.current = newRole;
                    setUserRole(newRole);
                    setKey(prev => prev + 1);
                }
            } else {
                const newRole = 'Farmer';
                if (newRole !== userRole) {
                    lastRoleRef.current = newRole;
                    setUserRole(newRole);
                    setKey(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Error loading user role:', error);
            const newRole = 'Farmer';
            if (newRole !== userRole) {
                lastRoleRef.current = newRole;
                setUserRole(newRole);
                setKey(prev => prev + 1);
            }
        } finally {
            setIsLoading(false);
        }
    };



    // Nếu đang loading, hiển thị loading state
    if (isLoading) {
        return null;
    }

    // Render tabs với conditional farmer-reports
    return (
        <Tabs
            key={`tabs-${key}`}
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.disabled,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: {},
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: userRole === 'DeliveryStaff' ? 'Trang chủ' : 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.sm,
        height: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    tabLabel: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        marginTop: Spacing.xs,
    },

});
