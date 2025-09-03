import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFarmerReportById, updateFarmerReport, GeneralFarmerReportUpdateDto } from '../../../core/api/generalFarmerReports.api';
import Background from '../../../components/Background';
import BackButton from '../../../components/BackButton';

export default function EditFarmerReportScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const spinValue = new Animated.Value(0);

    const [form, setForm] = useState<GeneralFarmerReportUpdateDto>({
        reportId: '',
        title: '',
        description: '',
        severityLevel: undefined,
    });

    useEffect(() => {
        if (submitting) {
            const spinAnimation = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();
        } else {
            spinValue.setValue(0);
        }
    }, [submitting]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        if (id) {
            fetchReportDetail(id as string);
        }
    }, [id]);

    const fetchReportDetail = async (reportId: string) => {
        try {
            setLoading(true);
            const data = await getFarmerReportById(reportId);

            setForm({
                reportId: reportId,
                title: data.title || '',
                description: data.description || '',
                severityLevel: data.severityLevel,
            });
        } catch (error) {
            console.error('❌ Error fetching report detail:', error);
            Alert.alert('Lỗi', 'Không thể tải chi tiết báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title?.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề báo cáo');
            return;
        }

        if (!form.description?.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả báo cáo');
            return;
        }

        if (form.severityLevel === undefined || form.severityLevel === null) {
            Alert.alert('Lỗi', 'Mức độ nghiêm trọng là bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            await updateFarmerReport(id as string, form);
            Alert.alert('Thành công', 'Cập nhật báo cáo thành công', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('❌ Error updating report:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật báo cáo');
        } finally {
            setSubmitting(false);
        }
    };

    const getSeverityText = (level: number | undefined) => {
        if (level === null || level === undefined) {
            return 'Chưa đánh giá';
        }

        switch (level) {
            case 3: return 'Cao';
            case 2: return 'Trung bình';
            case 1: return 'Thấp';
            case 0: return 'Thấp nhất';
            default: return `Mức ${level}`;
        }
    };

    if (loading) {
        return (
            <Background>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton />
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Chỉnh sửa báo cáo</Text>
                        <Text style={styles.headerSubtitle}>
                            Cập nhật thông tin báo cáo kỹ thuật
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tiêu đề *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={form.title}
                            onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
                            placeholder="Nhập tiêu đề báo cáo"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mô tả chi tiết *</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={form.description}
                            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                            placeholder="Mô tả chi tiết vấn đề..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Severity Level */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mức độ nghiêm trọng *</Text>
                        <View style={styles.severityContainer}>
                            <Text style={styles.severityText}>
                                {getSeverityText(form.severityLevel)}
                            </Text>
                            <Text style={styles.severityNote}>
                                (Mức độ nghiêm trọng được đánh giá bởi chuyên gia)
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <View style={styles.submitButtonContent}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Ionicons name="reload" size={20} color="white" />
                                </Animated.View>
                                <Text style={styles.submitButtonText}>Đang cập nhật...</Text>
                            </View>
                        ) : (
                            <View style={styles.submitButtonContent}>
                                <Ionicons name="save-outline" size={20} color="white" />
                                <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    formContainer: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    severityContainer: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    severityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    severityNote: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    submitButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
