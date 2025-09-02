import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WeatherTicker = () => {
    const [text, setText] = useState('');
    const translateX = useSharedValue(0);

    useEffect(() => {
        const today = format(new Date(), 'EEEE, dd/MM/yyyy');
        const temp = 31;
        const base = `Hôm nay: ${today} | 🌡️ Nhiệt độ: ${temp}°C | Chúc bạn một ngày làm việc hiệu quả!`;

        setText(`${base}     ${base}     ${base}`);
    }, []);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(-SCREEN_WIDTH, {
                duration: 8000,
                easing: Easing.linear,
            }),
            -1
        );
    }, [translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.Text
                numberOfLines={1}
                style={[
                    styles.text,
                    animatedStyle,
                    { width: SCREEN_WIDTH * 2.5 },
                ]}
            >
                {text}
            </Animated.Text>
        </View>
    );
};

export default WeatherTicker;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        height: 28,
        backgroundColor: '#E6E6EE',
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginVertical: 12,
        alignItems: 'center'
    },
    text: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6F4E37',
        flexWrap: 'nowrap',
    },
});
