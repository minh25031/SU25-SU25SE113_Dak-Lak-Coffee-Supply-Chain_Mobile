import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Card, Divider, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { createCropSeason, CropSeasonCreatePayload } from '@/core/api/cropSeason.api';
import { getAvailableCommitments, FarmingCommitmentViewAllDto } from '@/core/api/commitment.api';

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
    const [commitments, setCommitments] = useState<FarmingCommitmentViewAllDto[]>([]);
    const [loadingCommitments, setLoadingCommitments] = useState(true);
    const [selectedCommitment, setSelectedCommitment] = useState<FarmingCommitmentViewAllDto | null>(null);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load commitments
    useEffect(() => {
        loadCommitments();
    }, []);

    // Tự động điều chỉnh thời gian mùa vụ khi chọn commitment
    useEffect(() => {
        if (selectedCommitment && selectedCommitment.approvedAt) {
            // Kiểm tra nếu có approvedAt từ commitment
            const approvedDate = new Date(selectedCommitment.approvedAt);

            // Tính thời gian mùa vụ dựa trên approvedAt
            // Start date: bắt đầu từ ngày approved (cùng ngày)
            const seasonStart = new Date(approvedDate);

            // End date: 11 tháng sau start date
            const seasonEnd = new Date(seasonStart);
            seasonEnd.setMonth(seasonEnd.getMonth() + 11); // 11 tháng sau start date

            setStartDate(seasonStart);
            setEndDate(seasonEnd);
        }
    }, [selectedCommitment]);

    // Cập nhật selectedCommitment khi selectedCommitmentId thay đổi
    useEffect(() => {
        if (selectedCommitmentId && commitments.length > 0) {
            const commitment = commitments.find(c => c.commitmentId === selectedCommitmentId);
            setSelectedCommitment(commitment || null);
        }
    }, [selectedCommitmentId, commitments]);

    const loadCommitments = async () => {
        try {
            setLoadingCommitments(true);

            // Thử endpoint chính trước
            let response;
            try {
                response = await getAvailableCommitments();
            } catch (error) {
                // Thử endpoint khác nếu endpoint chính thất bại
                try {
                    const altResponse = await fetch('/api/FarmingCommitment/Farmer');
                    if (altResponse.ok) {
                        response = await altResponse.json();
                    }
                } catch (altError) {
                    // Handle alternative endpoint failure silently
                }
            }

            if (response && Array.isArray(response) && response.length > 0) {
                // Hiển thị tất cả commitment để user có thể chọn
                setCommitments(response);
                setSelectedCommitmentId(response[0].commitmentId);
                setSelectedCommitment(response[0]);
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
        } else if (seasonName.trim().length < 3) {
            newErrors.seasonName = 'Tên mùa vụ phải có ít nhất 3 ký tự';
        }

        if (!selectedCommitmentId) {
            newErrors.commitment = 'Vui lòng chọn cam kết';
        }

        if (startDate >= endDate) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        // Bỏ validation ngày bắt đầu không thể trong quá khứ
        // Cho phép nông dân chọn ngày bắt đầu linh hoạt

        // Kiểm tra thời gian mùa vụ phải trong khoảng 11-15 tháng
        if (startDate && endDate) {
            const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth());

            if (monthsDiff < 11 || monthsDiff > 15) { // Cho phép sai số 2 tháng để xử lý thiên tai
                newErrors.endDate = 'Thời gian mùa vụ phải trong khoảng 11-15 tháng (có thể kéo dài thêm 2-3 tháng nếu gặp thiên tai)';
            }
        }

        // Kiểm tra start date phải sau hoặc bằng ngày approved (nếu có)
        if (selectedCommitment?.approvedAt && startDate) {
            const approvedDate = new Date(selectedCommitment.approvedAt);
            if (startDate < approvedDate) {
                newErrors.startDate = 'Ngày bắt đầu mùa vụ phải sau hoặc bằng ngày cam kết được duyệt';
            }
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
                                        label: commitment.commitmentName,
                                        value: commitment.commitmentId
                                    }))}
                                    setOpen={setCommitmentOpen}
                                    setValue={setSelectedCommitmentId}
                                    onSelectItem={(item) => {
                                        if (item) {
                                            const commitment = commitments.find(c => c.commitmentId === item.value);
                                            setSelectedCommitment(commitment || null);
                                        }
                                    }}
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
                                {submitting ? 'Đang tạo...' : 'Tạo mùa vụ'}
                            </Button>

                            {/* Thông báo nếu commitment chưa được duyệt */}
                            {selectedCommitment && !selectedCommitment.approvedAt && (
                                <View style={styles.warningContainer}>
                                    <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" />
                                    <Text style={styles.warningMessage}>
                                        Cam kết này chưa được duyệt. Bạn vẫn có thể tạo mùa vụ nhưng cần chờ duyệt.
                                    </Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Selected Commitment Info */}
                    {selectedCommitment && (
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <Text style={styles.infoTitle}>Thông tin cam kết đã chọn</Text>
                                <Divider style={styles.divider} />

                                <View style={styles.commitmentInfo}>
                                    <Text style={styles.commitmentName}>{selectedCommitment.commitmentName}</Text>
                                    <Text style={styles.commitmentCode}>Mã: {selectedCommitment.commitmentCode}</Text>
                                    <Text style={styles.commitmentDescription}>
                                        Công ty: {selectedCommitment.companyName}
                                    </Text>
                                    <Text style={styles.commitmentDescription}>
                                        Kế hoạch: {selectedCommitment.planTitle}
                                    </Text>

                                    {/* Hiển thị thông tin từ commitment details */}
                                    {selectedCommitment.farmingCommitmentDetails && selectedCommitment.farmingCommitmentDetails.length > 0 && (
                                        <View style={styles.detailsContainer}>
                                            <Text style={styles.detailsTitle}>Chi tiết sản phẩm:</Text>
                                            {selectedCommitment.farmingCommitmentDetails.map((detail, index) => (
                                                <View key={detail.commitmentDetailId} style={styles.detailItem}>
                                                    <Text style={styles.detailText}>
                                                        {detail.coffeeTypeName} - {detail.committedQuantity} kg
                                                    </Text>
                                                    <Text style={styles.detailText}>
                                                        Giá: {detail.confirmedPrice?.toLocaleString()} VNĐ/kg
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Hiển thị trạng thái */}
                                    <View style={styles.statusContainer}>
                                        <Chip
                                            mode="outlined"
                                            style={[
                                                styles.statusChip,
                                                {
                                                    borderColor: selectedCommitment.status === 'Active' ? '#10B981' : '#F59E0B',
                                                    backgroundColor: selectedCommitment.status === 'Active' ? '#D1FAE5' : '#FEF3C7'
                                                }
                                            ]}
                                            textStyle={{
                                                color: selectedCommitment.status === 'Active' ? '#059669' : '#D97706'
                                            }}
                                        >
                                            {selectedCommitment.status === 'Active' ? 'Đang hoạt động' : 'Chờ duyệt'}
                                        </Chip>
                                    </View>

                                    {/* Hiển thị ngày duyệt nếu có */}
                                    {selectedCommitment.approvedAt && (
                                        <View style={styles.approvalInfo}>
                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                                            <Text style={styles.approvalText}>
                                                Đã duyệt: {new Date(selectedCommitment.approvedAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Thông báo nếu chưa được duyệt */}
                                    {!selectedCommitment.approvedAt && (
                                        <View style={styles.warningInfo}>
                                            <MaterialCommunityIcons name="alert-circle" size={16} color="#F59E0B" />
                                            <Text style={styles.warningText}>
                                                Cam kết này chưa được duyệt. Có thể tạo mùa vụ nhưng cần chờ duyệt.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    )}


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
    statusContainer: {
        marginTop: 8,
    },
    statusChip: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    approvalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    approvalText: {
        fontSize: 14,
        color: '#10B981',
        marginLeft: 8,
    },
    warningInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        padding: 10,
    },
    warningText: {
        fontSize: 14,
        color: '#D97706',
        marginLeft: 8,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        padding: 10,
    },
    warningMessage: {
        fontSize: 14,
        color: '#D97706',
        marginLeft: 8,
    },
    detailsContainer: {
        marginTop: 12,
        paddingLeft: 16,
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 8,
    },
    detailItem: {
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#0C4A6E',
        lineHeight: 20,
    },
});
