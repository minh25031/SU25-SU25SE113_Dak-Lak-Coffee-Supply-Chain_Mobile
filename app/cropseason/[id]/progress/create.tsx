import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason } from '@/core/api/cropSeason.api';
import { getCropStages, CropStage } from '@/core/api/cropStage.api';
import { createCropProgress, CropProgressCreateRequest, getCropProgressesByDetailId } from '@/core/api/cropProgress.api';

export default function CreateCropProgressScreen() {
    const { id, detailId } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;
    const selectedDetailId = detailId as string;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [selectedDetailIdState, setSelectedDetailIdState] = useState<string>(selectedDetailId || '');
    const [nextStage, setNextStage] = useState<CropStage | null>(null);
    const [progressDate, setProgressDate] = useState(new Date());
    const [actualYield, setActualYield] = useState<string>('');
    const [notes, setNotes] = useState('');

    // Media states
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    // Dropdown states
    const [detailOpen, setDetailOpen] = useState(false);

    // Data
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [stages, setStages] = useState<CropStage[]>([]);
    const [existingProgress, setExistingProgress] = useState<any[]>([]);

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    // Recalculate next stage when detail selection changes
    useEffect(() => {
        if (selectedDetailIdState && stages.length > 0) {
            calculateNextStage(stages);
        }
    }, [selectedDetailIdState, stages]);

    // Media handling functions
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5,
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'image/jpeg',
                    name: `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                }));
                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('❌ Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const newVideos = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.mimeType || 'video/mp4',
                    name: asset.name || `video_${Date.now()}.mp4`,
                }));
                setSelectedVideos(prev => [...prev, ...newVideos]);
            }
        } catch (error) {
            console.error('❌ Error picking video:', error);
            Alert.alert('Lỗi', 'Không thể chọn video. Vui lòng thử lại.');
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index: number) => {
        setSelectedVideos(prev => prev.filter((_, i) => i !== index));
    };

    const loadData = async () => {
        try {
            setLoading(true);

            // Load crop season
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
                // Auto-select detail if only one exists
                if (season.details && season.details.length === 1) {
                    setSelectedDetailIdState(season.details[0].detailId);
                }
            }

            // Load crop stages
            const cropStages = await getCropStages();
            setStages(cropStages);

            // Calculate next stage to complete
            if (selectedDetailIdState) {
                await calculateNextStage(cropStages);
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

    const calculateNextStage = async (stages: CropStage[]) => {
        try {
            // Sort stages by order
            const orderedStages = stages.sort((a, b) => a.orderIndex - b.orderIndex);

            // Load existing progress for this detail to determine next stage
            if (selectedDetailIdState) {
                try {
                    const existingProgress = await getCropProgressesByDetailId(selectedDetailIdState);
                    setExistingProgress(existingProgress);

                    // Find the next stage to complete
                    if (existingProgress.length === 0) {
                        // No progress yet, start with first stage
                        setNextStage(orderedStages[0]);
                    } else {
                        // Find the highest completed stage
                        const completedStageIds = existingProgress.map((p: any) => p.stageId);
                        const highestCompletedIndex = Math.max(...completedStageIds.map((id: number) =>
                            orderedStages.findIndex(s => s.stageId === id)
                        ));

                        // Next stage is the one after the highest completed
                        if (highestCompletedIndex < orderedStages.length - 1) {
                            setNextStage(orderedStages[highestCompletedIndex + 1]);
                        } else {
                            // All stages completed
                            setNextStage(null);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error loading existing progress:', error);
                    // Fallback to first stage
                    setNextStage(orderedStages[0]);
                }
            }
        } catch (error) {
            console.error('❌ Error calculating next stage:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!selectedDetailIdState) {
            newErrors.detail = 'Vui lòng chọn vùng trồng';
        }

        if (!nextStage) {
            newErrors.stage = 'Không tìm thấy giai đoạn tiếp theo';
        }

        if (progressDate > new Date()) {
            newErrors.date = 'Ngày tiến độ không thể là ngày trong tương lai';
        }

        // Chỉ validate sản lượng khi là giai đoạn thu hoạch
        if (nextStage && nextStage.stageCode?.toLowerCase() === 'harvesting') {
            if (!actualYield || parseFloat(actualYield) <= 0) {
                newErrors.yield = 'Sản lượng thu hoạch là bắt buộc và phải lớn hơn 0';
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
            const payload: CropProgressCreateRequest = {
                cropSeasonDetailId: selectedDetailIdState,
                stageId: nextStage!.stageId,
                progressDate: progressDate.toISOString().split('T')[0], // Format: yyyy-MM-dd
                actualYield: nextStage && nextStage.stageCode?.toLowerCase() === 'harvesting'
                    ? parseFloat(actualYield)
                    : undefined,
                notes: notes.trim() || undefined,
                mediaFiles: [...selectedImages, ...selectedVideos],
            };

            const result = await createCropProgress(payload);

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    `Đã tạo tiến độ cho giai đoạn: ${nextStage!.stageName}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Tạo tiến độ thất bại');
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi tạo tiến độ:', error);
            Alert.alert('Lỗi', error.message || 'Tạo tiến độ thất bại');
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

    return (
        <Background>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton goBack={() => router.back()} />
                    <Text style={styles.headerTitle}>Thêm tiến độ mới</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Season Info Card */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.infoTitle}>Thông tin mùa vụ</Text>
                            <Divider style={styles.divider} />
                            <Text style={styles.seasonName}>{cropSeason.seasonName}</Text>
                            <Text style={styles.seasonInfo}>
                                {formatDate(new Date(cropSeason.startDate))} - {formatDate(new Date(cropSeason.endDate))}
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Selected Detail Info Card */}
                    {selectedDetailIdState && cropSeason.details && (
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <Text style={styles.infoTitle}>Vùng trồng được chọn</Text>
                                <Divider style={styles.divider} />
                                {(() => {
                                    const selectedDetail = cropSeason.details.find(d => d.detailId === selectedDetailIdState);
                                    if (selectedDetail) {
                                        return (
                                            <>
                                                <Text style={styles.detailName}>{selectedDetail.typeName || 'N/A'}</Text>
                                                <Text style={styles.detailInfo}>
                                                    Diện tích: {selectedDetail.areaAllocated || 0} ha
                                                </Text>
                                                {selectedDetail.expectedHarvestStart && (
                                                    <Text style={styles.detailInfo}>
                                                        Thu hoạch dự kiến: {formatDate(new Date(selectedDetail.expectedHarvestStart))} - {formatDate(new Date(selectedDetail.expectedHarvestEnd))}
                                                    </Text>
                                                )}
                                                {selectedDetail.estimatedYield && (
                                                    <Text style={styles.detailInfo}>
                                                        Sản lượng dự kiến: {selectedDetail.estimatedYield} kg
                                                    </Text>
                                                )}
                                            </>
                                        );
                                    }
                                    return <Text style={styles.detailInfo}>Không tìm thấy thông tin vùng trồng</Text>;
                                })()}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Form Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Thông tin tiến độ</Text>
                            <Divider style={styles.divider} />

                            {/* Detail Selection */}
                            {cropSeason.details && cropSeason.details.length > 1 && (
                                <>
                                    <Text style={styles.label}>Chọn vùng trồng *</Text>
                                    <DropDownPicker
                                        open={detailOpen}
                                        value={selectedDetailIdState}
                                        items={cropSeason.details.map(detail => ({
                                            label: `${detail.typeName} (${detail.areaAllocated} ha)`,
                                            value: detail.detailId
                                        }))}
                                        setOpen={setDetailOpen}
                                        setValue={setSelectedDetailIdState}
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        placeholder="Chọn vùng trồng"
                                        searchable={true}
                                        searchPlaceholder="Tìm kiếm vùng trồng..."
                                        listMode="SCROLLVIEW"
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                    />
                                    {errors.detail && (
                                        <Text style={styles.errorText}>{errors.detail}</Text>
                                    )}
                                </>
                            )}

                            {/* Next Stage Display */}
                            <Text style={styles.label}>Giai đoạn tiếp theo</Text>
                            {nextStage ? (
                                <View style={styles.stageDisplay}>
                                    <Text style={styles.stageName}>{nextStage.stageName}</Text>
                                    <Text style={styles.stageText}>Mã: {nextStage.stageCode}</Text>
                                    {nextStage.description && (
                                        <Text style={styles.stageText}>
                                            {nextStage.description}
                                        </Text>
                                    )}
                                    {existingProgress.length > 0 && (
                                        <Text style={styles.progressInfo}>
                                            Đã hoàn thành {existingProgress.length} giai đoạn
                                        </Text>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.completedDisplay}>
                                    <Text style={styles.completedText}>🎉 Tất cả giai đoạn đã hoàn thành!</Text>
                                    <Text style={styles.completedSubtext}>
                                        Mùa vụ này đã hoàn thành tất cả các giai đoạn cần thiết.
                                    </Text>
                                </View>
                            )}
                            {errors.stage && (
                                <Text style={styles.errorText}>{errors.stage}</Text>
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
                            {nextStage && nextStage.stageCode?.toLowerCase() === 'harvesting' && (
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

                            {/* Media Upload */}
                            <Text style={styles.label}>Ảnh và Video (tùy chọn)</Text>
                            <Text style={styles.helpText}>
                                💡 Thêm ảnh hoặc video để ghi lại tiến độ mùa vụ
                            </Text>

                            {/* Image Upload */}
                            <View style={styles.mediaSection}>
                                <View style={styles.mediaHeader}>
                                    <Text style={styles.mediaTitle}>📸 Ảnh ({selectedImages.length}/5)</Text>
                                    <Button
                                        mode="outlined"
                                        onPress={pickImage}
                                        disabled={submitting || selectedImages.length >= 5}
                                        style={styles.mediaButton}
                                        icon={() => <MaterialCommunityIcons name="camera" size={20} color="#FD7622" />}
                                    >
                                        Chọn ảnh
                                    </Button>
                                </View>

                                {selectedImages.length > 0 && (
                                    <View style={styles.mediaGrid}>
                                        {selectedImages.map((image, index) => (
                                            <View key={index} style={styles.mediaItem}>
                                                <Image source={{ uri: image.uri }} style={styles.mediaPreview} />
                                                <IconButton
                                                    icon="close"
                                                    size={20}
                                                    onPress={() => removeImage(index)}
                                                    style={styles.removeButton}
                                                    iconColor="#EF4444"
                                                />
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Video Upload */}
                            <View style={styles.mediaSection}>
                                <View style={styles.mediaHeader}>
                                    <Text style={styles.mediaTitle}>🎥 Video ({selectedVideos.length}/3)</Text>
                                    <Button
                                        mode="outlined"
                                        onPress={pickVideo}
                                        disabled={submitting || selectedVideos.length >= 3}
                                        style={styles.mediaButton}
                                        icon={() => <MaterialCommunityIcons name="video" size={20} color="#FD7622" />}
                                    >
                                        Chọn video
                                    </Button>
                                </View>

                                {selectedVideos.length > 0 && (
                                    <View style={styles.mediaGrid}>
                                        {selectedVideos.map((video, index) => (
                                            <View key={index} style={styles.mediaItem}>
                                                <View style={styles.videoPreview}>
                                                    <MaterialCommunityIcons name="video" size={40} color="#6B7280" />
                                                    <Text style={styles.videoName}>{video.name}</Text>
                                                </View>
                                                <IconButton
                                                    icon="close"
                                                    size={20}
                                                    onPress={() => removeVideo(index)}
                                                    style={styles.removeButton}
                                                    iconColor="#EF4444"
                                                />
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

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
                                disabled={submitting || !selectedDetailIdState || !nextStage || existingProgress.length >= stages.length}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonLabel}
                            >
                                {existingProgress.length >= stages.length
                                    ? 'Tất cả giai đoạn đã hoàn thành'
                                    : `Tạo tiến độ cho ${nextStage?.stageName}`
                                }
                            </Button>
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
    seasonName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 8,
    },
    seasonInfo: {
        fontSize: 14,
        color: '#0EA5E9',
        lineHeight: 20,
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
    detailInfo: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    detailName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#0EA5E9',
        lineHeight: 20,
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
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 8,
        marginLeft: 4,
    },
    stageDisplay: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    progressInfo: {
        fontSize: 12,
        color: '#059669',
        fontStyle: 'italic',
        marginTop: 8,
    },
    completedDisplay: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    completedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 4,
    },
    completedSubtext: {
        fontSize: 12,
        color: '#B45309',
        textAlign: 'center',
    },
    // Media styles
    mediaSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mediaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mediaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    mediaButton: {
        borderColor: '#FD7622',
        borderWidth: 1,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    mediaItem: {
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    videoName: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});
