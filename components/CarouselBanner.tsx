import React from 'react';
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
    const renderBanner = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={banners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={carouselWidth + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContainer}
            />
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
});
