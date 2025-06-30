import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Trung tâm hỗ trợ</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Liên hệ</Text>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL('mailto:support@caphedaklak.vn')}
                    >
                        <MaterialCommunityIcons name="email-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Gửi email hỗ trợ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL('tel:+84901234567')}
                    >
                        <MaterialCommunityIcons name="phone-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Gọi hotline: 0901 234 567</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>

                    <TouchableOpacity style={styles.row}>
                        <MaterialCommunityIcons name="book-open-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Xem tài liệu hướng dẫn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <MaterialCommunityIcons name="video-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Xem video hướng dẫn</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>

                    <TouchableOpacity style={styles.row}>
                        <MaterialCommunityIcons name="help-circle-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Tôi quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <MaterialCommunityIcons name="account-outline" size={20} color="#555" />
                        <Text style={styles.rowText}>Làm sao để chỉnh sửa hồ sơ?</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    rowText: { marginLeft: 12, fontSize: 16, color: '#222' },
});
