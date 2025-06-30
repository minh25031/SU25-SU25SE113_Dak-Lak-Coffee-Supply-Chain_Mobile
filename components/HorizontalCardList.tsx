import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type CardItem = {
    title: string;
    description: string;
    icon: string;
};

export default function HorizontalCardList({ items }: { items: CardItem[] }) {
    return (
        <FlatList
            horizontal
            data={items}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.container}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#2E7D32" />
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        marginVertical: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginRight: 12,
        width: 200,
        elevation: 2,
    },
    title: {
        fontWeight: 'bold',
        marginTop: 8,
        fontSize: 14,
    },
    description: {
        fontSize: 12,
        color: '#555',
    },
});
