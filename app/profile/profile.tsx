import BackButton from '@/components/BackButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Thông tin cá nhân</Text>
            <Text style={styles.item}><Text style={styles.label}>Tên của bạn</Text><Text style={styles.value}> Minh</Text></Text>
            <Text style={styles.item}><Text style={styles.label}>Giới tính</Text><Text style={styles.value}> Nam</Text></Text>
            <Text style={styles.item}><Text style={styles.label}>Ngày sinh</Text><Text style={styles.value}> 25/03/2002</Text></Text>
            <Text style={styles.item}><Text style={styles.label}>Chiều cao</Text><Text style={styles.value}> 169 cm</Text></Text>
            <Text style={styles.item}><Text style={styles.label}>Email</Text><Text style={styles.value}> nguyenhenry961@gmail.com</Text></Text>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    item: { fontSize: 16, marginBottom: 16 },
    label: { color: '#555' },
    value: { fontWeight: 'bold' },
});