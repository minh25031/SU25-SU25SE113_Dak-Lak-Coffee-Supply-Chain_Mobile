import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    title: string;
    icon: string;
    onPress: () => void;
};

const COLORS = {
    primary: '#FD7622',
    background: '#FEFAF4',
    text: '#1F2937',
    border: '#F3F4F6',
};

export default function DashboardTile({ title, icon, onPress }: Props) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={32}
                    color={COLORS.primary}
                />
            </View>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    iconContainer: {
        marginBottom: 8,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.text,
    },
});
