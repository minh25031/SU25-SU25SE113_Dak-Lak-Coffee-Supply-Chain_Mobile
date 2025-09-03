import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createFarmerReport, getCropProgressesForCurrentFarmer } from '../../core/api/generalFarmerReports.api';
import { GeneralFarmerReportCreateDto } from '../../core/api/generalFarmerReports.api';
import Background from '../../components/Background';

export default function CreateFarmerReportScreen() {
    const router = useRouter();
    const { detailId } = useLocalSearchParams<{ detailId?: string }>();

    const [form, setForm] = useState<GeneralFarmerReportCreateDto>({
        reportType: 'Crop',
        severityLevel: 1, // Medium - giống web frontend
        title: '',
        description: '',
        cropProgressId: '',
        photoFiles: [],
        videoFiles: [],
    });

    const [cropProgressOptions, setCropProgressOptions] = useState<any[]>([]);
    const [groupedCropProgress, setGroupedCropProgress] = useState<{ [key: string]: any[] }>({});
    const [selectedCropSeason, setSelectedCropSeason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProgressList();
    }, []);

    const fetchProgressList = async () => {
        try {
            // Lấy crop progress
            const cropData = await getCropProgressesForCurrentFarmer();

            const grouped = cropData.reduce((acc, item) => {
                let seasonKey = '';

                // Thử nhiều field names khác nhau
                const seasonName = item.cropSeasonName || item.seasonName || item.cropSeason?.seasonName || item.season?.seasonName;
                const detailName = item.cropSeasonDetailName || item.detailName || item.cropSeasonDetail?.detailName || item.detail?.detailName;

                if (seasonName) {
                    seasonKey = seasonName;
                    if (detailName && detailName !== '') {
                        seasonKey += ` - ${detailName}`;
                    }
                } else {
                    seasonKey = 'Mùa vụ không xác định';
                }

                if (!acc[seasonKey]) {
                    acc[seasonKey] = [];
                }
                acc[seasonKey].push(item);
                return acc;
            }, {} as { [key: string]: any[] });

            setGroupedCropProgress(grouped);

            // Chọn mùa vụ đầu tiên làm mặc định
            const firstSeason = Object.keys(grouped)[0];
            if (firstSeason) {
                setSelectedCropSeason(firstSeason);
                setCropProgressOptions(grouped[firstSeason] || []);
            } else {
                setCropProgressOptions(cropData || []);
            }
        } catch (error) {
            console.error('❌ Error fetching progress list:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách tiến độ');
        }
    };

    const handleChange = (field: string, value: any) => {

        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePickMedia = async () => {
        try {
            Alert.alert(
                'Chọn loại media',
                'Bạn muốn chọn ảnh hay video?',
                [
                    {
                        text: 'Chọn ảnh',
                        onPress: () => pickImage(),
                    },
                    {
                        text: 'Chọn video',
                        onPress: () => pickVideo(),
                    },
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Error picking media:', error);
            Alert.alert('Lỗi', 'Không thể chọn media');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const newPhotos = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'image/jpeg',
                    name: `photo_${Date.now()}_${Math.random()}.jpg`,
                } as any));
                setForm(prev => ({ ...prev, photoFiles: [...prev.photoFiles, ...newPhotos] }));
            }
        } catch (error) {
            console.error('❌ Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const pickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsMultipleSelection: true,
                quality: 0.8,
                videoMaxDuration: 60, // Tối đa 60 giây
            });

            if (!result.canceled && result.assets) {
                const newVideos = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'video/mp4',
                    name: `video_${Date.now()}_${Math.random()}.mp4`,
                } as any));
                setForm(prev => ({ ...prev, videoFiles: [...prev.videoFiles, ...newVideos] }));
            }
        } catch (error) {
            console.error('❌ Error picking video:', error);
            Alert.alert('Lỗi', 'Không thể chọn video');
        }
    };

    const removePhoto = (index: number) => {
        setForm(prev => ({
            ...prev,
            photoFiles: prev.photoFiles.filter((_, i) => i !== index),
        }));
    };

    const removeVideo = (index: number) => {
        setForm(prev => ({
            ...prev,
            videoFiles: prev.videoFiles.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề báo cáo');
            return;
        }

        if (!form.description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả báo cáo');
            return;
        }

        if (form.reportType === 'Crop' && !form.cropProgressId) {
            Alert.alert('Lỗi', 'Vui lòng chọn tiến độ mùa vụ');
            return;
        }

        try {
            setIsSubmitting(true);
            await createFarmerReport(form);
            Alert.alert(
                'Thành công',
                'Báo cáo đã được gửi thành công',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Error creating report:', error);
            Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Background>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Tạo báo cáo kỹ thuật</Text>
                        <Text style={styles.headerSubtitle}>
                            Gửi yêu cầu tư vấn kỹ thuật đến chuyên gia
                        </Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.formContainer}>
                        {/* Report Type */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Loại báo cáo *</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        styles.radioButtonActive,
                                    ]}
                                    onPress={() => handleChange('reportType', 'Crop')}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        styles.radioCircleActive,
                                    ]}>
                                        <View style={styles.radioDot} />
                                    </View>
                                    <Text style={[
                                        styles.radioText,
                                        styles.radioTextActive,
                                    ]}>
                                        Mùa vụ
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Severity Level */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mức độ nghiêm trọng *</Text>
                            <View style={styles.severityGroup}>
                                {[
                                    { value: 0, label: 'Nhẹ', color: '#3B82F6' },
                                    { value: 1, label: 'Vừa', color: '#F59E0B' },
                                    { value: 2, label: 'Nghiêm trọng', color: '#EF4444' },
                                ].map((severity) => (
                                    <TouchableOpacity
                                        key={severity.value}
                                        style={[
                                            styles.severityButton,
                                            form.severityLevel === severity.value && styles.severityButtonActive,
                                            { borderColor: severity.color },
                                        ]}
                                        onPress={() => handleChange('severityLevel', severity.value)}
                                    >
                                        <View style={[
                                            styles.severityCircle,
                                            { backgroundColor: severity.color },
                                            form.severityLevel === severity.value && styles.severityCircleActive,
                                        ]}>
                                            {form.severityLevel === severity.value && <View style={styles.severityDot} />}
                                        </View>
                                        <Text style={[
                                            styles.severityText,
                                            form.severityLevel === severity.value && styles.severityTextActive,
                                        ]}>
                                            {severity.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Title */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tiêu đề báo cáo *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={form.title}
                                onChangeText={(value) => handleChange('title', value)}
                                placeholder="Ví dụ: Sâu bệnh tấn công giai đoạn ra hoa"
                                placeholderTextColor="#9CA3AF"
                                maxLength={200}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mô tả chi tiết *</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={form.description}
                                onChangeText={(value) => handleChange('description', value)}
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải trong mùa vụ (sâu bệnh, thời tiết, dinh dưỡng...)"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                maxLength={2000}
                            />
                        </View>

                        {/* Crop Progress Selection - Chỉ hiển thị khi chọn loại Crop */}
                        {form.reportType === 'Crop' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Chọn tiến độ mùa vụ *</Text>

                                {Object.keys(groupedCropProgress).length === 0 ? (
                                    <View style={styles.noDataContainer}>
                                        <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
                                        <Text style={styles.noDataText}>Không có mùa vụ nào để chọn</Text>
                                        <Text style={styles.noDataSubtext}>Vui lòng liên hệ quản lý để được thêm vào mùa vụ</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* Chọn mùa vụ trước */}
                                        <View style={styles.dropdownContainer}>
                                            <Text style={styles.subLabel}>Chọn mùa vụ *</Text>
                                            <TouchableOpacity
                                                style={styles.dropdown}
                                                onPress={() => {
                                                    const seasons = Object.keys(groupedCropProgress);
                                                    if (seasons.length > 1) {
                                                        Alert.alert(
                                                            'Chọn mùa vụ',
                                                            'Chọn mùa vụ cần báo cáo:',
                                                            seasons.map(season => ({
                                                                text: season,
                                                                onPress: () => {
                                                                    setSelectedCropSeason(season);
                                                                    setCropProgressOptions(groupedCropProgress[season] || []);
                                                                    setForm(prev => ({ ...prev, cropProgressId: '' }));
                                                                },
                                                            }))
                                                        );
                                                    }
                                                }}
                                            >
                                                <Text style={styles.dropdownText}>
                                                    {selectedCropSeason || '-- Chọn mùa vụ --'}
                                                </Text>
                                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Chọn giai đoạn sau khi đã chọn mùa vụ */}
                                        {selectedCropSeason && (
                                            <View style={styles.dropdownContainer}>
                                                <Text style={styles.subLabel}>Chọn giai đoạn *</Text>
                                                <TouchableOpacity
                                                    style={styles.dropdown}
                                                    onPress={() => {
                                                        if (cropProgressOptions.length > 0) {
                                                            Alert.alert(
                                                                'Chọn giai đoạn',
                                                                'Chọn giai đoạn cần báo cáo:',
                                                                cropProgressOptions.map(option => {
                                                                    const optionId = option.progressId || option.cropProgressId || option.id;
                                                                    const stageName = option.stageName || option.cropStageName || 'Giai đoạn không xác định';
                                                                    const date = option.progressDate ? new Date(option.progressDate).toLocaleDateString('vi-VN') :
                                                                        option.createdAt ? new Date(option.createdAt).toLocaleDateString('vi-VN') :
                                                                            option.updatedAt ? new Date(option.updatedAt).toLocaleDateString('vi-VN') : '';
                                                                    return {
                                                                        text: `${stageName}${date ? ` - ${date}` : ''}`,
                                                                        onPress: () => {
                                                                            handleChange('cropProgressId', optionId);
                                                                        },
                                                                    };
                                                                })
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>
                                                        {(() => {
                                                            if (!form.cropProgressId) return '-- Chọn giai đoạn --';
                                                            const selectedOption = cropProgressOptions.find(option => {
                                                                const optionId = option.progressId || option.cropProgressId || option.id;
                                                                return optionId === form.cropProgressId;
                                                            });
                                                            if (selectedOption) {
                                                                const stageName = selectedOption.stageName || selectedOption.cropStageName || 'Giai đoạn không xác định';
                                                                const date = selectedOption.progressDate ? new Date(selectedOption.progressDate).toLocaleDateString('vi-VN') :
                                                                    selectedOption.createdAt ? new Date(selectedOption.createdAt).toLocaleDateString('vi-VN') :
                                                                        selectedOption.updatedAt ? new Date(selectedOption.updatedAt).toLocaleDateString('vi-VN') : '';
                                                                return `${stageName}${date ? ` - ${date}` : ''}`;
                                                            }
                                                            return '-- Chọn giai đoạn --';
                                                        })()}
                                                    </Text>
                                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {selectedCropSeason && cropProgressOptions.length === 0 && (
                                            <View style={styles.noDataContainer}>
                                                <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
                                                <Text style={styles.noDataText}>Mùa vụ này chưa có giai đoạn nào</Text>
                                                <Text style={styles.noDataSubtext}>Vui lòng tạo giai đoạn cho mùa vụ này</Text>
                                            </View>
                                        )}

                                        {selectedCropSeason && cropProgressOptions.length > 0 && (
                                            <Text style={styles.helpText}>
                                                Chọn giai đoạn mùa vụ mà bạn gặp vấn đề để báo cáo
                                            </Text>
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        {/* Media Files */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tệp đính kèm (tùy chọn)</Text>
                            <TouchableOpacity
                                style={styles.mediaPickerButton}
                                onPress={handlePickMedia}
                            >
                                <Ionicons name="camera-outline" size={20} color="#F59E0B" />
                                <Text style={styles.mediaPickerText}>Chọn ảnh/video</Text>
                            </TouchableOpacity>



                            {/* Photo Files */}
                            {form.photoFiles.length > 0 && (
                                <View style={styles.filesContainer}>
                                    <Text style={styles.filesTitle}>Ảnh đã chọn ({form.photoFiles.length}):</Text>
                                    {form.photoFiles.map((file, index) => (
                                        <View key={index} style={styles.fileItem}>
                                            <Ionicons name="image-outline" size={20} color="#10B981" />
                                            <Text style={styles.fileName} numberOfLines={1}>
                                                {file.name || `Ảnh ${index + 1}`}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.removeFileButton}
                                                onPress={() => removePhoto(index)}
                                            >
                                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Video Files */}
                            {form.videoFiles.length > 0 && (
                                <View style={styles.filesContainer}>
                                    <Text style={styles.filesTitle}>Video đã chọn ({form.videoFiles.length}):</Text>
                                    {form.videoFiles.map((file, index) => (
                                        <View key={index} style={styles.fileItem}>
                                            <Ionicons name="videocam-outline" size={20} color="#10B981" />
                                            <Text style={styles.fileName} numberOfLines={1}>
                                                {file.name || `Video ${index + 1}`}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.removeFileButton}
                                                onPress={() => removeVideo(index)}
                                            >
                                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Text style={styles.submitButtonText}>Đang gửi...</Text>
                            ) : (
                                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 16,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    radioButtonActive: {
        borderColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleActive: {
        borderColor: '#F59E0B',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
    },
    radioText: {
        fontSize: 16,
        color: '#6B7280',
    },
    radioTextActive: {
        color: '#F59E0B',
        fontWeight: '600',
    },
    severityGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    severityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        flex: 1,
    },
    severityButtonActive: {
        backgroundColor: '#FEF3C7',
    },
    severityCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    severityCircleActive: {
        backgroundColor: '#F59E0B',
    },
    severityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
    },
    severityText: {
        fontSize: 14,
        color: '#6B7280',
    },
    severityTextActive: {
        color: '#F59E0B',
        fontWeight: '600',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        marginBottom: 12,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
    },

    mediaPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#F59E0B',
        borderStyle: 'dashed',
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
    },
    mediaPickerText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#F59E0B',
        fontWeight: '600',
    },
    mediaHelpText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        fontStyle: 'italic',
    },
    filesContainer: {
        marginTop: 16,
    },
    filesTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
        marginBottom: 8,
    },
    fileName: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#374151',
    },
    removeFileButton: {
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        marginTop: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 10,
        textAlign: 'center',
    },
    noDataSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 5,
        textAlign: 'center',
    },
    helpText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 10,
        textAlign: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#3B82F6',
        flex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});
