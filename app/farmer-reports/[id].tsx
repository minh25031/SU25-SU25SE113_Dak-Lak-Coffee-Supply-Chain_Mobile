import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFarmerReportById } from '../../core/api/generalFarmerReports.api';
import { GeneralFarmerReportViewAllDto } from '../../core/api/generalFarmerReports.api';
import Background from '../../components/Background';
import BackButton from '../../components/BackButton';

const { width } = Dimensions.get('window');

export default function FarmerReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [report, setReport] = useState<GeneralFarmerReportViewAllDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoadError, setImageLoadError] = useState(false);

    useEffect(() => {
        if (id) {
            fetchReportDetail(id as string);
        }
    }, [id]);

    const fetchReportDetail = async (reportId: string) => {
        try {
            setLoading(true);
            const data = await getFarmerReportById(reportId);


            setReport(data);
        } catch (error) {
            console.error('❌ Error fetching report detail:', error);
            Alert.alert('Lỗi', 'Không thể tải chi tiết báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (level: number) => {
        switch (level) {
            case 3: return '#EF4444'; // High - Red
            case 2: return '#F59E0B'; // Medium - Yellow
            case 1: return '#3B82F6'; // Low - Blue
            default: return '#6B7280'; // Default - Gray
        }
    };

    const getSeverityText = (level: number | undefined) => {
        // Kiểm tra nếu level là null/undefined
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

    const getReportTypeText = (type: string) => {
        switch (type) {
            case 'Crop': return 'Mùa vụ';
            case 'Processing': return 'Sơ chế';
            default: return type;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleEdit = () => {
        if (report) {
            router.push(`/farmer-reports/edit/${report.reportId}`);
        }
    };

    if (loading) {
        return (
            <Background>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang tải chi tiết báo cáo...</Text>
                </View>
            </Background>
        );
    }

    if (!report) {
        return (
            <Background>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Không tìm thấy báo cáo</Text>
                    <Text style={styles.errorSubtitle}>
                        Báo cáo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
                    </Text>
                    <TouchableOpacity
                        style={styles.errorBackButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.errorBackButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
                        <Text style={styles.headerSubtitle}>
                            Thông tin chi tiết về báo cáo kỹ thuật
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEdit}
                    >
                        <Ionicons name="create-outline" size={24} color="#F59E0B" />
                    </TouchableOpacity>
                </View>

                {/* Report Card */}
                <View style={styles.reportCard}>
                    {/* Title and Status */}
                    <View style={styles.titleSection}>
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severityLevel || 0) }]}>
                                <Text style={styles.severityText}>
                                    {getSeverityText(report.severityLevel)}
                                </Text>
                            </View>
                            {report.isResolved ? (
                                <View style={styles.resolvedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                    <Text style={styles.resolvedText}>Đã xử lý</Text>
                                </View>
                            ) : (
                                <View style={styles.pendingBadge}>
                                    <Ionicons name="time" size={16} color="#F59E0B" />
                                    <Text style={styles.pendingText}>Chờ xử lý</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{report.description}</Text>
                    </View>

                    {/* Report Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin báo cáo</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Ionicons name="leaf-outline" size={20} color="#6B7280" />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Loại báo cáo</Text>
                                    <Text style={styles.infoValue}>{getReportTypeText(report.reportType)}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Ngày báo cáo</Text>
                                    <Text style={styles.infoValue}>{formatDate(report.reportedAt)}</Text>
                                </View>
                            </View>

                            {report.cropSeasonName && (
                                <View style={styles.infoItem}>
                                    <Ionicons name="flower-outline" size={20} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Mùa vụ</Text>
                                        <Text style={styles.infoValue}>{report.cropSeasonName}</Text>
                                    </View>
                                </View>
                            )}

                            {report.processingBatchCode && (
                                <View style={styles.infoItem}>
                                    <Ionicons name="settings-outline" size={20} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Mã lô sơ chế</Text>
                                        <Text style={styles.infoValue}>{report.processingBatchCode}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Media Files */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tệp đính kèm</Text>

                        {/* Photos Section - Luôn hiển thị */}
                        <View style={styles.mediaSection}>
                            <Text style={styles.mediaTitle}>Hình ảnh</Text>

                            {/* Kiểm tra có ảnh nào không */}
                            {(report.photoFiles && report.photoFiles.length > 0) || (report as any).imageUrl ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                                    {/* Hiển thị photoFiles nếu có */}
                                    {report.photoFiles && report.photoFiles.length > 0 && report.photoFiles.map((photo: string, index: number) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.mediaItem}
                                            onPress={() => {
                                                // setSelectedImage(photo); // Removed
                                                // setShowImageModal(true); // Removed
                                            }}
                                        >
                                            <Image
                                                source={{ uri: photo }}
                                                style={styles.mediaImage}
                                                resizeMode="cover"
                                                onError={() => { }}
                                            />
                                        </TouchableOpacity>
                                    ))}

                                    {/* Hiển thị imageUrl nếu có */}
                                    {(report as any).imageUrl && (
                                        <TouchableOpacity
                                            style={styles.mediaItem}
                                            onPress={() => {
                                                if (!imageLoadError) {
                                                    // setSelectedImage((report as any).imageUrl); // Removed
                                                    // setShowImageModal(true); // Removed
                                                }
                                            }}
                                        >
                                            {!imageLoadError ? (
                                                <Image
                                                    source={{ uri: (report as any).imageUrl }}
                                                    style={styles.mediaImage}
                                                    resizeMode="cover"
                                                    onError={(error) => {
                                                        setImageLoadError(true);
                                                    }}
                                                    onLoad={() => {
                                                        setImageLoadError(false);
                                                    }}
                                                />
                                            ) : (
                                                <View style={styles.errorImageContainer}>
                                                    <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                                                    <Text style={styles.errorImageText}>Lỗi tải ảnh</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                            ) : (
                                <View style={styles.noMediaContainer}>
                                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                                    <Text style={styles.noMediaText}>Không có hình ảnh nào</Text>
                                </View>
                            )}
                        </View>

                        {/* Videos Section - Luôn hiển thị */}
                        <View style={styles.mediaSection}>
                            <Text style={styles.mediaTitle}>Video</Text>

                            {/* Kiểm tra có video nào không */}
                            {(report.videoFiles && report.videoFiles.length > 0) || (report as any).videoUrl ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                                    {/* Hiển thị videoFiles nếu có */}
                                    {report.videoFiles && report.videoFiles.length > 0 && report.videoFiles.map((video: string, index: number) => (
                                        <View key={index} style={styles.mediaItem}>
                                            <View style={styles.videoThumbnail}>
                                                <Ionicons name="play-circle" size={48} color="white" />
                                            </View>
                                        </View>
                                    ))}

                                    {/* Hiển thị videoUrl nếu có */}
                                    {(report as any).videoUrl && (
                                        <View style={styles.mediaItem}>
                                            <View style={styles.videoThumbnail}>
                                                <Ionicons name="play-circle" size={48} color="white" />
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            ) : (
                                <View style={styles.noMediaContainer}>
                                    <Ionicons name="videocam-outline" size={24} color="#9CA3AF" />
                                    <Text style={styles.noMediaText}>Không có video nào</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Image Modal */}
            {/* Removed showImageModal and selectedImage from here */}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorBackButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorBackButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    editButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportCard: {
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
    titleSection: {
        marginBottom: 24,
    },
    reportTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        lineHeight: 32,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    severityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    severityText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    resolvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    resolvedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
        marginLeft: 6,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    pendingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
        marginLeft: 6,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    mediaSection: {
        marginBottom: 20,
    },
    mediaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    mediaScroll: {
        marginHorizontal: -8,
    },
    mediaItem: {
        marginHorizontal: 8,
    },
    mediaImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    videoThumbnail: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noMediaContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noMediaText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 10,
    },
    errorImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    errorImageText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 10,
        textAlign: 'center',
    },
});
