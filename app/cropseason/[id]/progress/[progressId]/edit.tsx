import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason } from '@/core/api/cropSeason.api';
import { getCropStages, CropStage } from '@/core/api/cropStage.api';
import { getCropProgressById, updateCropProgress, CropProgressViewDetailsDto, CropProgressUpdateRequest } from '@/core/api/cropProgress.api';

export default function EditCropProgressScreen() {
    const { id, progressId } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;
    const progressIdParam = progressId as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [progressDate, setProgressDate] = useState(new Date());
    const [actualYield, setActualYield] = useState<string>('');
    const [notes, setNotes] = useState('');

    // Data
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [stages, setStages] = useState<CropStage[]>([]);
    const [progress, setProgress] = useState<CropProgressViewDetailsDto | null>(null);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load progress data
            const progressData = await getCropProgressById(progressIdParam);
            if (progressData) {
                setProgress(progressData);
                setProgressDate(new Date(progressData.progressDate || new Date()));
                setActualYield(progressData.actualYield?.toString() || '');
                setNotes(progressData.note || '');
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin tiến độ');
                router.back();
                return;
            }

            // Load crop season
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
            }

            // Load crop stages
            const cropStages = await getCropStages();
            setStages(cropStages);
        } catch (error) {
            console.error('❌ Error loading data:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.',
                [
                    {
                        text: 'Thử lại',
                        onPress: () => loadData()
                    },
                    {
                        text: 'Quay lại',
                        style: 'cancel',
                        onPress: () => router.back()
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};



        if (progressDate > new Date()) {
            newErrors.date = 'Ngày tiến độ không thể là ngày trong tương lai';
        }

        // Chỉ validate sản lượng khi là giai đoạn thu hoạch
        if (progress && stages.find(s => s.stageId === progress.stageId)?.stageCode?.toLowerCase() === 'harvesting') {
            if (!actualYield || parseFloat(actualYield) <= 0) {
                newErrors.yield = 'Sản lượng thu hoạch là bắt buộc và phải lớn hơn 0';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !progress) {
            return;
        }

        setSubmitting(true);
        try {
            const payload: CropProgressUpdateRequest = {
                ProgressId: progressIdParam,  // Use the ID from URL params
                CropSeasonDetailId: progress.cropSeasonDetailId,
                StageId: progress.stageId,  // Keep original stage ID
                StageDescription: stages.find(s => s.stageId === progress.stageId)?.description || '',
                ProgressDate: progressDate.toISOString(),
                ActualYield: progress && stages.find(s => s.stageId === progress.stageId)?.stageCode?.toLowerCase() === 'harvesting'
                    ? parseFloat(actualYield)
                    : undefined,
                Note: notes.trim() || undefined,
            };

            const result = await updateCropProgress(progress.progressId, payload);

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    'Đã cập nhật tiến độ thành công!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Cập nhật tiến độ thất bại');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi cập nhật tiến độ:', error);
            Alert.alert('Lỗi', error.message || 'Cập nhật tiến độ thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('vi-VN');
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setProgressDate(selectedDate);
        }
    };

    if (loading) {
        return (
            <Background>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FD7622" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </Background>
        );
    }

    if (!progress || !cropSeason) {
        return (
            <Background>
                <View style={styles.errorContainer}>
                    <Text>Không tìm thấy thông tin tiến độ</Text>
                    <Text style={{ marginTop: 8, color: '#6B7280' }}>
                        Vui lòng thử lại sau
                    </Text>
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton goBack={() => router.back()} />
                    <Text style={styles.headerTitle}>Sửa tiến độ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Progress Info Card */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.infoTitle}>📋 Thông tin tiến độ hiện tại</Text>
                            <Divider style={styles.divider} />
                            <Text style={styles.progressInfo}>
                                Mùa vụ: {cropSeason.seasonName}
                            </Text>
                            <Text style={styles.progressInfo}>
                                Giai đoạn: {stages.find(s => s.stageId === progress.stageId)?.stageName || 'N/A'}
                            </Text>
                            <Text style={styles.progressInfo}>
                                Ngày tạo: {formatDate(new Date(progress.createdAt))}
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Form Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Cập nhật thông tin</Text>
                            <Divider style={styles.divider} />

                            {/* Current Stage Display */}
                            <Text style={styles.label}>Giai đoạn hiện tại</Text>
                            {progress && (
                                <View style={styles.stageDisplay}>
                                    <Text style={styles.stageName}>
                                        {stages.find(s => s.stageId === progress.stageId)?.stageName || 'N/A'}
                                    </Text>
                                    <Text style={styles.stageText}>
                                        Mã: {stages.find(s => s.stageId === progress.stageId)?.stageCode || 'N/A'}
                                    </Text>
                                    {stages.find(s => s.stageId === progress.stageId)?.description && (
                                        <Text style={styles.stageText}>
                                            {stages.find(s => s.stageId === progress.stageId)?.description}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Progress Date */}
                            <Text style={styles.label}>Ngày tiến độ *</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                                disabled={submitting}
                                icon={() => <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />}
                            >
                                {formatDate(progressDate)}
                            </Button>
                            {errors.date && (
                                <Text style={styles.errorText}>{errors.date}</Text>
                            )}

                            {/* Actual Yield - Chỉ hiển thị khi là giai đoạn thu hoạch */}
                            {progress && stages.find(s => s.stageId === progress.stageId)?.stageCode?.toLowerCase() === 'harvesting' && (
                                <>
                                    <Text style={styles.label}>Sản lượng thu hoạch (kg) *</Text>
                                    <Text style={styles.helpText}>
                                        💡 Chỉ cần nhập sản lượng khi thu hoạch
                                    </Text>
                                    <TextInput
                                        label="Sản lượng thực tế"
                                        value={actualYield}
                                        onChangeText={setActualYield}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        error={!!errors.yield}
                                        disabled={submitting}
                                        placeholder="Nhập sản lượng thu hoạch..."
                                    />
                                    {errors.yield && (
                                        <Text style={styles.errorText}>{errors.yield}</Text>
                                    )}
                                </>
                            )}

                            {/* Notes */}
                            <TextInput
                                label="Ghi chú (tùy chọn)"
                                value={notes}
                                onChangeText={setNotes}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                                disabled={submitting}
                            />

                            {/* Submit Button */}
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={submitting}
                                disabled={submitting}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonLabel}
                            >
                                Cập nhật tiến độ
                            </Button>
                        </Card.Content>
                    </Card>



                    {/* Original Data Info */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.infoTitle}>📋 Dữ liệu gốc</Text>
                            <Divider style={styles.divider} />
                            <Text style={styles.originalText}>
                                Giai đoạn ban đầu: {stages.find(s => s.stageId === progress.stageId)?.stageName || 'N/A'}
                            </Text>
                            <Text style={styles.originalText}>
                                Ngày tạo: {formatDate(new Date(progress.createdAt))}
                            </Text>
                            {progress.updatedAt && (
                                <Text style={styles.originalText}>
                                    Lần cập nhật cuối: {formatDate(new Date(progress.updatedAt))}
                                </Text>
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={progressDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </View>
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
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0EA5E9',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 16,
    },
    divider: {
        marginVertical: 16,
    },
    progressInfo: {
        fontSize: 14,
        color: '#0EA5E9',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    dropdown: {
        marginBottom: 16,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    dropdownContainer: {
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    dateButton: {
        marginBottom: 16,
        borderColor: '#D1D5DB',
        justifyContent: 'flex-start',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 8,
        marginLeft: 12,
    },
    submitButton: {
        marginTop: 16,
        backgroundColor: '#FD7622',
        paddingVertical: 8,
    },
    submitButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    stageInfo: {
        gap: 8,
    },
    stageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
    },
    stageText: {
        fontSize: 14,
        color: '#0EA5E9',
        lineHeight: 20,
    },
    originalText: {
        fontSize: 14,
        color: '#0EA5E9',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 8,
        marginLeft: 4,
    },
    stageDisplay: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0EA5E9',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
});
