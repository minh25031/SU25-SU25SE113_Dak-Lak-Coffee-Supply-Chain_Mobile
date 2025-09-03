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

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason } from '@/core/api/cropSeason.api';
import { getCropSeasonDetailById, updateCropSeasonDetail, CropSeasonDetail, CropSeasonDetailUpdatePayload } from '@/core/api/cropSeasonDetail.api';

export default function EditCropSeasonDetailScreen() {
    const { id, detailId } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;
    const detailIdParam = detailId as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [areaAllocated, setAreaAllocated] = useState<string>('');
    const [plannedQuality, setPlannedQuality] = useState<string>('');
    const [expectedHarvestStart, setExpectedHarvestStart] = useState(new Date());
    const [expectedHarvestEnd, setExpectedHarvestEnd] = useState(new Date());

    // Data
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [detail, setDetail] = useState<CropSeasonDetail | null>(null);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load crop season detail
            const detailData = await getCropSeasonDetailById(detailIdParam);
            if (detailData) {
                setDetail(detailData);
                setAreaAllocated(detailData.areaAllocated?.toString() || '');
                setPlannedQuality(detailData.plannedQuality || '');
                setExpectedHarvestStart(new Date(detailData.expectedHarvestStart || new Date()));
                setExpectedHarvestEnd(new Date(detailData.expectedHarvestEnd || new Date()));
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin vùng trồng');
                router.back();
                return;
            }

            // Load crop season
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
            }

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

        if (!areaAllocated || parseFloat(areaAllocated) <= 0) {
            newErrors.area = 'Diện tích phải lớn hơn 0';
        }

        if (expectedHarvestStart >= expectedHarvestEnd) {
            newErrors.harvestEnd = 'Ngày kết thúc thu hoạch phải sau ngày bắt đầu';
        }

        // Bỏ validation ngày bắt đầu thu hoạch không thể trong quá khứ
        // Cho phép nông dân chọn ngày thu hoạch linh hoạt

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !detail) {
            return;
        }

        setSubmitting(true);
        try {
            const payload: CropSeasonDetailUpdatePayload = {
                detailId: detailIdParam,
                areaAllocated: parseFloat(areaAllocated),
                plannedQuality: plannedQuality.trim() || '',
                expectedHarvestStart: expectedHarvestStart.toISOString().split('T')[0],
                expectedHarvestEnd: expectedHarvestEnd.toISOString().split('T')[0],
                estimatedYield: detail.estimatedYield || 0,
                actualYield: detail.actualYield || undefined,
            };

            const result = await updateCropSeasonDetail(detailIdParam, payload);

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    'Đã cập nhật vùng trồng thành công!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Cập nhật vùng trồng thất bại');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi cập nhật vùng trồng:', error);
            Alert.alert('Lỗi', error.message || 'Cập nhật vùng trồng thất bại');
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
            setExpectedHarvestStart(selectedDate);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setExpectedHarvestEnd(selectedDate);
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

    if (!detail || !cropSeason) {
        return (
            <Background>
                <View style={styles.errorContainer}>
                    <Text>Không tìm thấy thông tin vùng trồng</Text>
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
                    <Text style={styles.headerTitle}>Chỉnh sửa vùng trồng</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Detail Info Card */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.infoTitle}>Thông tin vùng trồng hiện tại</Text>
                            <Divider style={styles.divider} />
                            <Text style={styles.detailInfo}>
                                Mùa vụ: {cropSeason.seasonName}
                            </Text>
                            <Text style={styles.detailInfo}>
                                Loại cà phê: {detail.typeName || 'N/A'}
                            </Text>
                            <Text style={styles.detailInfo}>
                                Diện tích hiện tại: {detail.areaAllocated || 0} ha
                            </Text>
                            {detail.plannedQuality && (
                                <Text style={styles.detailInfo}>
                                    Chất lượng hiện tại: {detail.plannedQuality}
                                </Text>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Form Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Cập nhật thông tin</Text>
                            <Divider style={styles.divider} />

                            {/* Area Allocated */}
                            <TextInput
                                label="Diện tích phân bổ (ha) *"
                                value={areaAllocated}
                                onChangeText={setAreaAllocated}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                                error={!!errors.area}
                                disabled={submitting}
                            />
                            {errors.area && (
                                <Text style={styles.errorText}>{errors.area}</Text>
                            )}

                            {/* Planned Quality */}
                            <Text style={styles.label}>Chất lượng dự kiến</Text>
                            <TextInput
                                label="Chất lượng dự kiến"
                                value={plannedQuality}
                                onChangeText={setPlannedQuality}
                                mode="outlined"
                                style={styles.input}
                                disabled={submitting}
                                placeholder="Nhập chất lượng dự kiến..."
                            />
                            <Text style={styles.helpText}>
                                💡 Gợi ý: SCA 90+, Premium Arabica, Fine Robusta, Organic, Fair Trade
                            </Text>

                            {/* Expected Harvest Start */}
                            <Text style={styles.label}>Ngày bắt đầu thu hoạch dự kiến *</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setShowStartDatePicker(true)}
                                style={styles.dateButton}
                                disabled={submitting}
                                icon={() => <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />}
                            >
                                {formatDate(expectedHarvestStart)}
                            </Button>
                            {errors.harvestStart && (
                                <Text style={styles.errorText}>{errors.harvestStart}</Text>
                            )}

                            {/* Expected Harvest End */}
                            <Text style={styles.label}>Ngày kết thúc thu hoạch dự kiến *</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setShowEndDatePicker(true)}
                                style={styles.dateButton}
                                disabled={submitting}
                                icon={() => <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />}
                            >
                                {formatDate(expectedHarvestEnd)}
                            </Button>
                            {errors.harvestEnd && (
                                <Text style={styles.errorText}>{errors.harvestEnd}</Text>
                            )}

                            {/* Submit Button */}
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={submitting}
                                disabled={submitting || !areaAllocated}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonLabel}
                            >
                                Cập nhật vùng trồng
                            </Button>
                        </Card.Content>
                    </Card>

                    {/* Quality Info */}
                    {plannedQuality && (
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <Text style={styles.infoTitle}>Chất lượng đã chọn</Text>
                                <Divider style={styles.divider} />
                                <Text style={styles.qualityText}>
                                    {plannedQuality}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={expectedHarvestStart}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={expectedHarvestEnd}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                        minimumDate={expectedHarvestStart}
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
    detailInfo: {
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
    qualityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
    },
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
});
