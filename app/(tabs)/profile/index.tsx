import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';

export default function AccountMain() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Header text="Hồ sơ cá nhân" />
            <View style={{ height: 12 }} />
            <TouchableOpacity style={styles.profileRow} onPress={() => router.push('/profile/profile')}>
                <View style={styles.avatar}><Text style={styles.avatarText}>H</Text></View>
                <Text style={styles.name}>Minh</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#aaa" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>CỘNG ĐỒNG</Text>
                <TouchableOpacity style={styles.row}>
                    <MaterialCommunityIcons name="account-group-outline" size={20} color="#888" />
                    <Text style={styles.rowText}>Tham gia cộng đồng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row}>
                    <MaterialCommunityIcons name="web" size={20} color="#888" />
                    <Text style={styles.rowText}>Tìm trên mạng xã hội</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>PHÁP LÝ</Text>
                <TouchableOpacity style={styles.row}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#888" />
                    <Text style={styles.rowText}>Chính sách quyền riêng tư</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color="#888" />
                    <Text style={styles.rowText}>Điều khoản sử dụng</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
                <TouchableOpacity style={styles.row}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#e11d48" />
                    <Text style={[styles.rowText, { color: '#e11d48' }]}>Xoá dữ liệu và tài khoản</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={() => router.replace('/auth/login')}>
                    <MaterialCommunityIcons name="logout" size={20} color="#e11d48" />
                    <Text style={[styles.rowText, { color: '#e11d48' }]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, fontWeight: 'bold' },
    name: { marginLeft: 12, fontSize: 18, fontWeight: 'bold' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    rowText: { marginLeft: 12, fontSize: 16 },
});