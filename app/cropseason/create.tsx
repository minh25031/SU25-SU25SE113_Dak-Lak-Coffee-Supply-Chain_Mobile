import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { createCropSeason, CropSeasonCreatePayload } from '@/core/api/cropSeason.api';
import { getFarmerCommitments, CommitmentListItem } from '@/core/api/commitment.api';

export default function CreateCropSeasonScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [seasonName, setSeasonName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Commitment dropdown states
    const [commitmentOpen, setCommitmentOpen] = useState(false);
    const [commitments, setCommitments] = useState<CommitmentListItem[]>([]);
    const [loadingCommitments, setLoadingCommitments] = useState(true);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load commitments
    useEffect(() => {
        loadCommitments();
    }, []);

    const loadCommitments = async () => {
        try {
            setLoadingCommitments(true);

            // Sử dụng API thực tế
            const response = await getFarmerCommitments();
            if (response && response.length > 0) {
                setCommitments(response);
                setSelectedCommitmentId(response[0].id);
            } else {
                // Nếu không có commitment nào, hiển thị thông báo
                Alert.alert(
                    'Không có cam kết',
                    'Bạn cần có cam kết trước khi tạo mùa vụ. Vui lòng liên hệ quản lý để được hỗ trợ.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back()
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Error loading commitments:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tải danh sách cam kết. Vui lòng kiểm tra kết nối mạng và thử lại.',
                [
                    {
                        text: 'Thử lại',
                        onPress: () => loadCommitments()
                    },
                    {
                        text: 'Quay lại',
                        style: 'cancel',
                        onPress: () => router.back()
                    }
                ]
            );
        } finally {
            setLoadingCommitments(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!seasonName.trim()) {
            newErrors.seasonName = 'Tên mùa vụ không được để trống';
        }

        if (!selectedCommitmentId) {
            newErrors.commitment = 'Vui lòng chọn cam kết';
        }

        if (startDate >= endDate) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        if (startDate < new Date()) {
            newErrors.startDate = 'Ngày bắt đầu không thể là ngày trong quá khứ';
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
            const payload: CropSeasonCreatePayload = {
                commitmentId: selectedCommitmentId,
                seasonName: seasonName.trim(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                note: note.trim() || undefined,
            };

            const result = await createCropSeason(payload);

            if (result.code === 1) {
                Alert.alert(
                    'Thành công',
                    'Đã tạo mùa vụ mới thành công!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.message || 'Tạo mùa vụ thất bại');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi tạo mùa vụ:', error);
            Alert.alert('Lỗi', error.message || 'Tạo mùa vụ thất bại');
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

    return (
        <Background>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton goBack={() => router.back()} />
                    <Text style={styles.headerTitle}>Tạo mùa vụ mới</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Form Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Thông tin mùa vụ</Text>
                            <Divider style={styles.divider} />

                            {/* Commitment Selection */}
                            <Text style={styles.label}>Chọn cam kết *</Text>
                            {loadingCommitments ? (
                                <View style={styles.loadingCommitment}>
                                    <ActivityIndicator size="small" color="#FD7622" />
                                    <Text style={styles.loadingCommitmentText}>Đang tải danh sách cam kết...</Text>
                                </View>
                            ) : (
                                <DropDownPicker
                                    open={commitmentOpen}
                                    value={selectedCommitmentId}
                                    items={commitments.map(commitment => ({
                                        label: commitment.name,
                                        value: commitment.id
                                    }))}
                                    setOpen={setCommitmentOpen}
                                    setValue={setSelectedCommitmentId}
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    placeholder="Chọn cam kết"
                                    searchable={true}
                                    searchPlaceholder="Tìm kiếm cam kết..."
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            )}
                            {errors.commitment && (
                                <Text style={styles.errorText}>{errors.commitment}</Text>
                            )}

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
                                disabled={submitting || loadingCommitments}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonLabel}
                            >
                                Tạo mùa vụ
                            </Button>
                        </Card.Content>
                    </Card>

                    {/* Selected Commitment Info */}
                    {selectedCommitmentId && (
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <Text style={styles.infoTitle}>📋 Thông tin cam kết đã chọn</Text>
                                <Divider style={styles.divider} />

                                {(() => {
                                    const selectedCommitment = commitments.find(c => c.id === selectedCommitmentId);
                                    if (!selectedCommitment) return null;

                                    return (
                                        <View style={styles.commitmentInfo}>
                                            <Text style={styles.commitmentName}>{selectedCommitment.name}</Text>
                                            <Text style={styles.commitmentCode}>Mã: {selectedCommitment.code}</Text>
                                            <Text style={styles.commitmentDescription}>
                                                Loại: {selectedCommitment.coffeeType} | Chất lượng: {selectedCommitment.qualityGrade}
                                            </Text>
                                            <Text style={styles.commitmentDescription}>
                                                Diện tích: {selectedCommitment.totalArea} ha | Sản lượng: {selectedCommitment.totalQuantity} kg
                                            </Text>
                                        </View>
                                    );
                                })()}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Info Card */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.infoTitle}>📋 Hướng dẫn</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.infoItem}>
                                <Text style={styles.infoBullet}>•</Text>
                                <Text style={styles.infoText}>
                                    Chọn cam kết phù hợp với loại cây trồng và kế hoạch sản xuất
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoBullet}>•</Text>
                                <Text style={styles.infoText}>
                                    Tên mùa vụ nên mô tả rõ ràng về thời gian và loại cây trồng
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoBullet}>•</Text>
                                <Text style={styles.infoText}>
                                    Ngày bắt đầu và kết thúc phải hợp lý với chu kỳ sinh trưởng của cây
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoBullet}>•</Text>
                                <Text style={styles.infoText}>
                                    Ghi chú có thể mô tả thêm về điều kiện thời tiết, đất đai, hoặc kế hoạch cụ thể
                                </Text>
                            </View>
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
                        minimumDate={new Date()}
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
    loadingCommitment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginBottom: 16,
    },
    loadingCommitmentText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
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
    infoCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0EA5E9',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    infoBullet: {
        fontSize: 16,
        color: '#0EA5E9',
        marginRight: 8,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#0C4A6E',
        lineHeight: 20,
    },
    commitmentInfo: {
        gap: 8,
    },
    commitmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
    },
    commitmentCode: {
        fontSize: 14,
        color: '#0EA5E9',
        fontWeight: '500',
    },
    commitmentDescription: {
        fontSize: 14,
        color: '#0C4A6E',
        lineHeight: 20,
    },
});
