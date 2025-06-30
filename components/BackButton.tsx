import React from 'react';
import { IconButton } from 'react-native-paper';

export default function BackButton({ goBack }: { goBack?: () => void }) {
    return <IconButton icon="arrow-left" size={24} onPress={goBack} />;
}
