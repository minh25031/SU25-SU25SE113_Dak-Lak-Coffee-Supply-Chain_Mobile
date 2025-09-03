import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

type CardItem = {
    title: string;
    description: string;
    icon: string;
};

export default function HorizontalCardList({ items }: { items: CardItem[] }) {
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const autoScrollIntervalRef = useRef<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll functionality
    useEffect(() => {
        if (autoScrollEnabled && items.length > 0) {
            startAutoScroll();
        }

        return () => {
            stopAutoScroll();
        };
    }, [autoScrollEnabled, items]);

    const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }

        autoScrollIntervalRef.current = setInterval(() => {
            if (flatListRef.current && items.length > 0) {
                const nextIndex = (currentIndex + 1) % items.length;
                setCurrentIndex(nextIndex);

                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                    viewPosition: 0.5
                });
            }
        }, 2000); // Scroll mỗi 2 giây
    };

    const stopAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    const toggleAutoScroll = () => {
        setAutoScrollEnabled(!autoScrollEnabled);
        if (!autoScrollEnabled) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    };

    return (
        <View style={styles.wrapper}>
            {/* Auto-scroll Toggle Button */}
            <View style={styles.autoScrollContainer}>
                <Text style={styles.autoScrollLabel}>Auto-scroll:</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                        {autoScrollEnabled ? 'Bật' : 'Tắt'}
                    </Text>
                    <MaterialCommunityIcons
                        name={autoScrollEnabled ? "play-circle" : "pause-circle"}
                        size={16}
                        color={autoScrollEnabled ? "#10B981" : "#6B7280"}
                    />
                </View>
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleAutoScroll}
                >
                    <Text style={styles.toggleButtonText}>
                        {autoScrollEnabled ? 'Tắt' : 'Bật'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                horizontal
                data={items}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.container}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <MaterialCommunityIcons name={item.icon as any} size={24} color="#2E7D32" />
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 8,
    },
    autoScrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginBottom: 12,
    },
    autoScrollLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    toggleText: {
        fontSize: 12,
        color: '#6B7280',
    },
    toggleButton: {
        backgroundColor: '#FD7622',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    container: {
        paddingHorizontal: 10,
        marginVertical: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginRight: 12,
        width: 200,
        elevation: 2,
    },
    title: {
        fontWeight: 'bold',
        marginTop: 8,
        fontSize: 14,
    },
    description: {
        fontSize: 12,
        color: '#555',
    },
});
