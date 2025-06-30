import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

// Lấy chiều rộng màn hình
const { width } = Dimensions.get('window');
const carouselWidth = width - 32;
const aspectRatio = 16 / 9; // Tỷ lệ 16:9
const carouselHeight = carouselWidth / aspectRatio;

// Danh sách banner
const banners = [
    {
        image: require('../assets/images/banner1.png'),
    },
    {
        image: require('../assets/images/banner2.png'),
    },
    {
        image: require('../assets/images/banner3.png'),
    },
];

export default function CarouselBanner() {
    return (
        <View style={styles.container}>
            <Carousel
                width={carouselWidth}
                height={carouselHeight}
                autoPlay
                data={banners}
                scrollAnimationDuration={1500}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={item.image} style={styles.image} />
                    </View>
                )}
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
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FD7622', // Primary màu cam sáng
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});
