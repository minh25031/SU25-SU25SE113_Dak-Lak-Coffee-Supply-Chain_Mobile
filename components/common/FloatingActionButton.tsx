import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Components } from '@/core/constants';

interface FloatingActionButtonProps extends TouchableOpacityProps {
    icon: string;
    onPress: () => void;
    size?: 'small' | 'medium' | 'large';
    gradient?: boolean;
    gradientColors?: string[];
    style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    icon,
    onPress,
    size = 'medium',
    gradient = true,
    gradientColors = Colors.gradients.primary,
    style,
    ...props
}) => {
    const sizeStyles = {
        small: Components.button.sm,
        medium: Components.button.md,
        large: Components.button.lg,
    };

    const iconSizes = {
        small: Spacing.icon.md,
        medium: Spacing.icon.lg,
        large: Spacing.icon.xl,
    };

    const buttonStyle = [
        styles.button,
        sizeStyles[size],
        style,
    ];

    const content = (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            activeOpacity={0.8}
            {...props}
        >
            {gradient ? (
                <LinearGradient
                    colors={gradientColors}
                    style={[styles.gradient, sizeStyles[size]]}
                >
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={iconSizes[size]}
                        color={Colors.text.inverse}
                    />
                </LinearGradient>
            ) : (
                <MaterialCommunityIcons
                    name={icon as any}
                    size={iconSizes[size]}
                    color={Colors.text.inverse}
                />
            )}
        </TouchableOpacity>
    );

    return content;
};

const styles = StyleSheet.create({
    button: {
        shadowColor: '#000',
        shadowOffset: Spacing.shadow.lg,
        shadowOpacity: 0.3,
        shadowRadius: Spacing.shadow.lg.height,
        elevation: 8,
    },
    gradient: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
