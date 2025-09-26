import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStatusColor, getStatusText, getStatusIcon } from '@/core/utils/statusUtils';

interface StatusBadgeProps {
    status: string;
    type?: 'processing' | 'cropSeason' | 'warehouse' | 'general';
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}

const getIconSize = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
        case 'small':
            return 12;
        case 'large':
            return 16;
        default:
            return 14;
    }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    type = 'general',
    size = 'medium',
    showIcon = true,
}) => {
    const color = getStatusColor(status, type);
    const text = getStatusText(status, type);
    const icon = getStatusIcon(status, type);

    const sizeStyles = {
        small: styles.small,
        medium: styles.medium,
        large: styles.large,
    };

    const textSizeStyles = {
        small: styles.textSmall,
        medium: styles.textMedium,
        large: styles.textLarge,
    };

    return (
        <View style={[styles.container, { backgroundColor: color }, sizeStyles[size]]}>
            {showIcon && (
                <MaterialCommunityIcons
                    name={icon as any}
                    size={getIconSize(size)}
                    color="white"
                    style={styles.icon}
                />
            )}
            <Text style={[styles.text, textSizeStyles[size]]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    small: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    medium: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    large: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        color: 'white',
        fontWeight: '600',
    },
    textSmall: {
        fontSize: 10,
    },
    textMedium: {
        fontSize: 12,
    },
    textLarge: {
        fontSize: 14,
    },
});
