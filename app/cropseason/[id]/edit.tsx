import React, { useCallback, useState, useEffect } from 'react';
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

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import {
    getCropSeasonById,
    updateCropSeason,
    CropSeasonUpdatePayload,
    CropSeason,
    CropSeasonStatusValue
} from '@/core/api/cropSeason.api';

export default function EditCropSeasonScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);

    // Form data
    const [seasonName, setSeasonName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [note, setNote] = useState('');

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loadCropSeason = useCallback(async () => {
        if (!cropSeasonId) return;

        try {
            setLoading(true);
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
                setSeasonName(season.seasonName);
                setStartDate(new Date(season.startDate));
                setEndDate(new Date(season.endDate));
                setNote(season.note || '');
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin mùa vụ');
                router.back();
            }
        } catch (error) {
            console.error('❌ Error loading crop season:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tải thông tin mùa vụ. Vui lòng kiểm tra kết nối mạng và thử lại.',
                [
                    {
                        text: 'Thử lại',
                        onPress: () => loadCropSeason()
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
    }, [cropSeasonId, router]);

    useEffect(() => {
        loadCropSeason();
    }, [loadCropSeason]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!seasonName.trim()) {
            newErrors.seasonName = 'Tên mùa vụ không được để trống';
        }

        if (startDate >= endDate) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            const payload: CropSeasonUpdatePayload = {
                CropSeasonId: cropSeasonId,
                SeasonName: seasonName.trim(),
                StartDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD for DateOnly
                EndDate: endDate.toISOString().split('T')[0],   // Format as YYYY-MM-DD for DateOnly
                Note: note.trim() || null,
            };

            const result = await updateCropSeason(cropSeasonId, payload);

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    'Đã cập nhật mùa vụ thành công!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Cập nhật mùa vụ thất bại');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi cập nhật mùa vụ:', error);
            Alert.alert('Lỗi', error.message || 'Cập nhật mùa vụ thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('vi-VN');
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            // Nếu ngày kết thúc trước ngày bắt đầu mới, cập nhật ngày kết thúc
            if (endDate <= selectedDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setDate(newEndDate.getDate() + 30); // Mặc định 30 ngày
                setEndDate(newEndDate);
            }
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
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

    if (!cropSeason) {
        return (
            <Background>
                <View style={styles.errorContainer}>
                    <Text>Không tìm thấy thông tin mùa vụ</Text>
                    <Text style={{ marginTop: 8, color: '#6B7280' }}>
                        Vui lòng thử lại sau
                    </Text>
                </View>
            </Background>
        );
    }

    // Kiểm tra xem có thể sửa không
    const canEdit = cropSeason.status !== CropSeasonStatusValue.Completed &&
        cropSeason.status !== CropSeasonStatusValue.Cancelled;

    if (!canEdit) {
        return (
            <Background>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <BackButton goBack={() => router.back()} />
                        <Text style={styles.headerTitle}>Sửa mùa vụ</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.content}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Không thể sửa</Text>
                                <Divider style={styles.divider} />
                                <Text style={styles.errorText}>
                                    Mùa vụ này không thể sửa vì đã {cropSeason.status === CropSeasonStatusValue.Completed ? 'hoàn thành' : 'bị hủy'}.
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>
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
                    <Text style={styles.headerTitle}>Sửa mùa vụ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Form Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Thông tin mùa vụ</Text>
                            <Divider style={styles.divider} />

                            {/* Season Name */}
                            <TextInput
                                label="Tên mùa vụ *"
                                value={seasonName}
                                onChangeText={setSeasonName}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.seasonName}
                                disabled={submitting}
                            />
                            {errors.seasonName && (
                                <Text style={styles.errorText}>{errors.seasonName}</Text>
                            )}

                            {/* Start Date */}
                            <Text style={styles.label}>Ngày bắt đầu *</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setShowStartDatePicker(true)}
                                style={styles.dateButton}
                                disabled={submitting}
                                icon={() => <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />}
                            >
                                {formatDate(startDate)}
                            </Button>
                            {errors.startDate && (
                                <Text style={styles.errorText}>{errors.startDate}</Text>
                            )}

                            {/* End Date */}
                            <Text style={styles.label}>Ngày kết thúc *</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setShowEndDatePicker(true)}
                                style={styles.dateButton}
                                disabled={submitting}
                                icon={() => <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />}
                            >
                                {formatDate(endDate)}
                            </Button>
                            {errors.endDate && (
                                <Text style={styles.errorText}>{errors.endDate}</Text>
                            )}

                            {/* Note */}
                            <TextInput
                                label="Ghi chú (tùy chọn)"
                                value={note}
                                onChangeText={setNote}
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
                                Cập nhật mùa vụ
                            </Button>
                        </Card.Content>
                    </Card>

                    {/* Current Status Card */}
                    <Card style={styles.statusCard}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Trạng thái hiện tại</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.statusInfo}>
                                <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
                                <Text style={styles.statusText}>
                                    Mùa vụ hiện tại đang ở trạng thái: {cropSeason.status}
                                </Text>
                            </View>

                            <Text style={styles.statusNote}>
                                Lưu ý: Chỉ có thể sửa mùa vụ khi chưa hoàn thành hoặc bị hủy.
                            </Text>
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                        minimumDate={startDate}
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    divider: {
        marginVertical: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
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
    statusCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0EA5E9',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statusText: {
        flex: 1,
        fontSize: 14,
        color: '#0C4A6E',
    },
    statusNote: {
        fontSize: 12,
        color: '#0EA5E9',
        fontStyle: 'italic',
        lineHeight: 16,
    },
});
