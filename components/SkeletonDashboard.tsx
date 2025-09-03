import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
    width: number | string;
    height: number;
    borderRadius?: number;
}

const SkeletonItem: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8 }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeletonItem,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
            ]}
        />
    );
};

const SkeletonDashboard: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.userInfo}>
                        <SkeletonItem width={120} height={16} />
                        <SkeletonItem width={180} height={24} />
                        <SkeletonItem width={100} height={20} />
                    </View>
                    <SkeletonItem width={60} height={60} borderRadius={30} />
                </View>
            </View>

            {/* Banner Skeleton */}
            <View style={styles.bannerContainer}>
                <SkeletonItem width="100%" height={150} borderRadius={16} />
            </View>

            {/* Stats Skeleton */}
            <View style={styles.statsContainer}>
                <SkeletonItem width={120} height={20} />
                <View style={styles.statsGrid}>
                    <SkeletonItem width="30%" height={80} borderRadius={16} />
                    <SkeletonItem width="30%" height={80} borderRadius={16} />
                    <SkeletonItem width="30%" height={80} borderRadius={16} />
                </View>
            </View>

            {/* Menu Items Skeleton */}
            <View style={styles.menuContainer}>
                <SkeletonItem width={150} height={20} />
                <View style={styles.menuGrid}>
                    <SkeletonItem width="100%" height={80} borderRadius={16} />
                    <SkeletonItem width="100%" height={80} borderRadius={16} />
                    <SkeletonItem width="100%" height={80} borderRadius={16} />
                </View>
            </View>

            {/* Activities Skeleton */}
            <View style={styles.activityContainer}>
                <SkeletonItem width={140} height={20} />
                <View style={styles.activityList}>
                    <SkeletonItem width="100%" height={60} borderRadius={12} />
                    <SkeletonItem width="100%" height={60} borderRadius={12} />
                    <SkeletonItem width="100%" height={60} borderRadius={12} />
                </View>
            </View>
        </View>
    );
};

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
        gap: 8,
    },
    bannerContainer: {
        marginTop: -20,
        marginHorizontal: 24,
        marginBottom: 30,
    },
    statsContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
        gap: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    menuContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
        gap: 20,
    },
    menuGrid: {
        gap: 12,
    },
    activityContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
        gap: 20,
    },
    activityList: {
        gap: 16,
    },
    skeletonItem: {
        backgroundColor: '#E5E7EB',
    },
});

export default SkeletonDashboard;
