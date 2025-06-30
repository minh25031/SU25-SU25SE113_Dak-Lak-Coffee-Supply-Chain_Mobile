import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Background({ children }: { children: React.ReactNode }) {
    return <View style={styles.background}>{children}</View>;
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#E6E6EE',
    },
});