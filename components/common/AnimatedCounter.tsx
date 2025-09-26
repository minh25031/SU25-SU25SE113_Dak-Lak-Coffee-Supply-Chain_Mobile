import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    style?: TextStyle;
    prefix?: string;
    suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 1000,
    style,
    prefix = '',
    suffix = '',
}) => {
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withTiming(value, { duration });
    }, [value, duration, animatedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animatedValue.value, [0, value], [0, 1]);
        const scale = interpolate(animatedValue.value, [0, value], [0.8, 1]);

        return {
            opacity,
            transform: [{ scale }],
        };
    });

    return (
        <Animated.Text style={[styles.text, style, animatedStyle]}>
            {prefix}{Math.round(animatedValue.value)}{suffix}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
});

