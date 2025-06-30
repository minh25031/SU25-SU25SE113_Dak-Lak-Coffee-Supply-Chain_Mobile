import React from 'react';
import { Text } from 'react-native';
import { TextInput as PaperInput } from 'react-native-paper';

export default function TextInput({ label, errorText, ...props }: any) {
    return (
        <>
            <PaperInput label={label} mode="outlined" style={{ marginBottom: 4 }} {...props} />
            {!!errorText && <Text style={{ color: 'red', marginBottom: 8 }}>{errorText}</Text>}
        </>
    );
}
