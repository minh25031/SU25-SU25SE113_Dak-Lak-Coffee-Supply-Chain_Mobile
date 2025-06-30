import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

export default function Button({ children, ...props }: any) {
    return (
        <PaperButton
            mode="contained"
            style={{ marginVertical: 10 }}
            contentStyle={{ paddingVertical: 8 }}
            {...props}
        >
            {children}
        </PaperButton>
    );
}