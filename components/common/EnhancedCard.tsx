import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Components } from '@/core/constants';

interface EnhancedCardProps extends TouchableOpacityProps {
    children: React.ReactNode;
    gradient?: boolean;
    gradientColors?: string[];
    shadow?: boolean;
    borderRadius?: number;
    style?: ViewStyle;
    onPress?: () => void;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
    children,
    gradient = false,
    gradientColors = [Colors.surface, Colors.background],
    shadow = true,
    borderRadius = Components.card.borderRadius,
    style,
    onPress,
    ...props
}) => {
    const cardStyle = [
        styles.card,
        shadow && styles.shadow,
        { borderRadius },
        style,
    ];

    const content = (
        <View style={cardStyle}>
            {gradient ? (
                <LinearGradient
                    colors={gradientColors}
                    style={[styles.gradient, { borderRadius }]}
                >
                    {children}
                </LinearGradient>
            ) : (
                children
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                {...props}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
    },
    gradient: {
        padding: Components.card.padding,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: Spacing.shadow.lg,
        shadowOpacity: Components.card.shadowOpacity,
        shadowRadius: Components.card.shadowRadius,
        elevation: Components.card.elevation,
    },
});
