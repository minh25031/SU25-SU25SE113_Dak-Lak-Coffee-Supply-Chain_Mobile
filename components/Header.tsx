import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    text: string;
    rightElement?: React.ReactNode;
};

export default function Header({ text, rightElement }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.title}>{text}</Text>
            {rightElement && <View style={styles.right}>{rightElement}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#E6E6EE',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
