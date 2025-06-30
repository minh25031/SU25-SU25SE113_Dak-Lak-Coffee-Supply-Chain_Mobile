import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function Paragraph({ children }: { children: React.ReactNode }) {
    return <Text style={styles.paragraph}>{children}</Text>;
}

const styles = StyleSheet.create({
    paragraph: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        color: '#374151',
    },
});
