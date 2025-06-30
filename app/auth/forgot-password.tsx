import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import BackButton from '../../components/BackButton';
import Background from '../../components/Background';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Logo from '../../components/Logo';
import TextInput from '../../components/TextInput';
import { emailValidator } from '../../core/utils';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState({ value: '', error: '' });

    const onSendPressed = () => {
        const emailError = emailValidator(email.value);
        if (emailError) {
            setEmail({ ...email, error: emailError });
            return;
        }
        router.replace('/auth/login');
    };

    return (
        <Background>
            <BackButton goBack={() => router.back()} />
            <Logo />
            <Header text="Restore Password" />

            <TextInput
                label="E-mail address"
                returnKeyType="done"
                value={email.value}
                onChangeText={(text: string) => setEmail({ value: text, error: '' })}
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Button mode="contained" onPress={onSendPressed} style={styles.button}>
                Send Reset Instructions
            </Button>

            <TouchableOpacity style={styles.back} onPress={() => router.push('/auth/login')}>
                <Text style={styles.label}>← Back to login</Text>
            </TouchableOpacity>
        </Background>
    );
}

const styles = StyleSheet.create({
    back: {
        width: '100%',
        marginTop: 12,
    },
    button: {
        marginTop: 12,
    },
    label: {
        color: '#6B7280',
        width: '100%',
    },
});
