import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function Logo() {
    return <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />;
}

const styles = StyleSheet.create({
    logo: {
        width: 300,
        height: 300,
        alignSelf: 'center',
        marginBottom: 16,
    },
});