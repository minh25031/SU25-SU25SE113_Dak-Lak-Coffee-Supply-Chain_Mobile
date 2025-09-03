import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View, FlatList } from 'react-native';

// Lấy chiều rộng màn hình
const { width } = Dimensions.get('window');
const carouselWidth = width - 32;
const aspectRatio = 16 / 9; // Tỷ lệ 16:9
const carouselHeight = carouselWidth / aspectRatio;

// Danh sách banner
const banners = [
    {
        id: '1',
        image: require('../assets/images/banner1.png'),
    },
    {
        id: '2',
        image: require('../assets/images/banner2.png'),
    },
    {
        id: '3',
        image: require('../assets/images/banner3.png'),
    },
];

export default function CarouselBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const autoScrollIntervalRef = useRef<any>(null);

    // Auto-scroll functionality
    useEffect(() => {
        startAutoScroll();

        return () => {
            stopAutoScroll();
        };
    }, []);

    const startAutoScroll = () => {
        autoScrollIntervalRef.current = setInterval(() => {
            if (flatListRef.current && banners.length > 0) {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % banners.length;

                    // Scroll đến ảnh tiếp theo với animation mượt mà
                    flatListRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true,
                        viewPosition: 0.5
                    });

                    return nextIndex;
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



    const renderBanner = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={carouselWidth + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContainer}
                scrollEnabled={false}
                onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (carouselWidth + 16));
                    setCurrentIndex(newIndex);
                }}
            />

            {/* Dots indicator */}
            <View style={styles.dotsContainer}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: index === currentIndex ? '#FD7622' : '#D1D5DB' }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginVertical: 12,
        alignItems: 'center',
    },
    scrollContainer: {
        paddingHorizontal: 8,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FD7622', // Primary màu cam sáng
        width: carouselWidth,
        height: carouselHeight,
        marginHorizontal: 8,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
});
