import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Card, Divider, Chip, Button, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason } from '@/core/api/cropSeason.api';
import { getCropStages, CropStage } from '@/core/api/cropStage.api';
import { getCropProgressById, CropProgressViewDetailsDto } from '@/core/api/cropProgress.api';

export default function CropProgressDetailScreen() {
    const { id, progressId } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;
    const progressIdParam = progressId as string;

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<CropProgressViewDetailsDto | null>(null);
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [stage, setStage] = useState<CropStage | null>(null);

    // Media modal state
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

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

                // Load crop season
                const season = await getCropSeasonById(cropSeasonId);
                if (season) {
                    setCropSeason(season);
                }

                // Load stage information
                if (progressData.stageId) {
                    try {
                        const stages = await getCropStages();
                        const currentStage = stages.find(s => s.stageId === progressData.stageId);
                        if (currentStage) {
                            setStage(currentStage);
                            console.log('✅ Stage loaded:', currentStage);
                        } else {
                            console.warn('⚠️ Stage not found for ID:', progressData.stageId);
                        }
                    } catch (error) {
                        console.error('❌ Error loading stage:', error);
                    }
                }
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin tiến độ');
                router.back();
                return;
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/cropseason/${cropSeasonId}/progress/${progressIdParam}/edit`);
    };

    const handleViewMedia = (type: 'image' | 'video', url: string) => {
        setSelectedMedia({ type, url });
        setMediaModalVisible(true);
    };

    const closeMediaModal = () => {
        setMediaModalVisible(false);
        setSelectedMedia(null);
    };

    const getStageName = (stageId: number): string => {
        if (stage && stage.stageId === stageId) {
            return stage.stageName || `Giai đoạn ${stageId}`;
        }
        return `Giai đoạn ${stageId}`;
    };

    const getStageColor = (stageId: number): string => {
        if (stage && stage.stageId === stageId) {
            // Sử dụng stageId để tạo màu thay vì orderIndex
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
            return colors[stageId % colors.length];
        }
        return '#6B7280'; // Default color
    };

    const getStageDescription = (stageId: number): string => {
        if (stage && stage.stageId === stageId) {
            return stage.description || 'Không có mô tả';
        }
        return 'Không có mô tả';
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return 'N/A';
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
                    <Text style={styles.headerTitle}>Chi tiết tiến độ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Progress Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.titleRow}>
                                <Text style={styles.progressTitle}>Tiến độ trồng trọt</Text>
                                <Chip
                                    mode="outlined"
                                    style={[
                                        styles.stageChip,
                                        { borderColor: getStageColor(progress.stageId) }
                                    ]}
                                    textStyle={{ color: getStageColor(progress.stageId) }}
                                >
                                    {getStageName(progress.stageId)}
                                </Chip>
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Ngày tiến độ</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(progress.progressDate || '')}
                                    </Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Cập nhật bởi</Text>
                                    <Text style={styles.infoValue}>
                                        {progress.updatedByName || 'N/A'}
                                    </Text>
                                </View>

                                {progress.actualYield && (
                                    <View style={styles.infoItem}>
                                        <MaterialCommunityIcons name="scale" size={20} color="#6B7280" />
                                        <Text style={styles.infoLabel}>Sản lượng</Text>
                                        <Text style={styles.infoValue}>
                                            {progress.actualYield} kg
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="clock" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Ngày tạo</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(progress.createdAt)}
                                    </Text>
                                </View>
                            </View>

                            {progress.note && (
                                <>
                                    <Divider style={styles.divider} />
                                    <View style={styles.noteContainer}>
                                        <MaterialCommunityIcons name="note-text" size={20} color="#6B7280" />
                                        <Text style={styles.noteLabel}>Ghi chú:</Text>
                                        <Text style={styles.noteText}>{progress.note}</Text>
                                    </View>
                                </>
                            )}

                            {/* Media Section */}
                            {(progress.photoUrl || progress.videoUrl) && (
                                <>
                                    <Divider style={styles.divider} />
                                    <View style={styles.mediaContainer}>
                                        <Text style={styles.mediaTitle}>📸 Ảnh và Video</Text>


                                        {/* Photos */}
                                        {progress.photoUrl && progress.photoUrl.trim() !== '' && (
                                            <View style={styles.mediaSection}>
                                                <Text style={styles.mediaSubtitle}>📷 Ảnh tiến độ</Text>
                                                <TouchableOpacity
                                                    style={styles.mediaItem}
                                                    onPress={() => handleViewMedia('image', progress.photoUrl)}
                                                >
                                                    <Image
                                                        source={{ uri: progress.photoUrl }}
                                                        style={styles.mediaPreview}
                                                        resizeMode="cover"

                                                    />
                                                    <View style={styles.mediaOverlay}>
                                                        <MaterialCommunityIcons name="eye" size={24} color="#FFFFFF" />
                                                    </View>
                                                </TouchableOpacity>

                                            </View>
                                        )}

                                        {/* Videos */}
                                        {progress.videoUrl && progress.videoUrl.trim() !== '' && (
                                            <View style={styles.mediaSection}>
                                                <Text style={styles.mediaSubtitle}>🎥 Video tiến độ</Text>
                                                <TouchableOpacity
                                                    style={styles.mediaItem}
                                                    onPress={() => handleViewMedia('video', progress.videoUrl)}
                                                >
                                                    <View style={styles.videoPreview}>
                                                        <MaterialCommunityIcons name="video" size={40} color="#6B7280" />
                                                        <Text style={styles.videoLabel}>Xem video</Text>
                                                    </View>
                                                    <View style={styles.mediaOverlay}>
                                                        <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Season Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Thông tin mùa vụ</Text>
                            <Divider style={styles.divider} />

                            <Text style={styles.seasonName}>{cropSeason.seasonName}</Text>
                            <Text style={styles.seasonInfo}>
                                {formatDate(cropSeason.startDate)} - {formatDate(cropSeason.endDate)}
                            </Text>

                            {cropSeason.area && (
                                <Text style={styles.seasonInfo}>
                                    Diện tích: {cropSeason.area} ha
                                </Text>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Stage Info Card */}
                    {(() => {
                        const currentStage = stage; // Use the single stage object
                        if (!currentStage) {
                            return (
                                <Card style={styles.card}>
                                    <Card.Content>
                                        <Text style={styles.cardTitle}>Thông tin giai đoạn</Text>
                                        <Divider style={styles.divider} />
                                        <Text style={styles.stageName}>Giai đoạn {progress.stageId}</Text>
                                        <Text style={styles.stageCode}>Mã: N/A</Text>
                                        <Text style={styles.stageDescription}>
                                            Không thể tải thông tin giai đoạn từ server
                                        </Text>
                                        <Text style={styles.stageOrder}>Thứ tự: N/A</Text>
                                    </Card.Content>
                                </Card>
                            );
                        }

                        return (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.cardTitle}>Thông tin giai đoạn</Text>
                                    <Divider style={styles.divider} />

                                    <Text style={styles.stageName}>
                                        {currentStage.stageName || `Giai đoạn ${currentStage.stageId}`}
                                    </Text>
                                    <Text style={styles.stageCode}>
                                        Mã: {currentStage.stageCode || 'N/A'}
                                    </Text>
                                    {currentStage.description && (
                                        <Text style={styles.stageDescription}>
                                            {currentStage.description}
                                        </Text>
                                    )}
                                    <Text style={styles.stageOrder}>
                                        Thứ tự: {currentStage.orderIndex !== undefined ? currentStage.orderIndex + 1 : 'N/A'}
                                    </Text>
                                </Card.Content>
                            </Card>
                        );
                    })()}

                    {/* Actions Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Hành động</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.actionButtons}>
                                <Button
                                    mode="contained"
                                    onPress={handleEdit}
                                    style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                                    icon={() => <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />}
                                >
                                    Sửa tiến độ
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Media Modal */}
                <Portal>
                    <Modal
                        visible={mediaModalVisible}
                        onDismiss={closeMediaModal}
                        contentContainerStyle={styles.modalContainer}
                    >
                        {selectedMedia && (
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {selectedMedia.type === 'image' ? '📷 Xem ảnh' : '🎥 Xem video'}
                                    </Text>
                                    <TouchableOpacity onPress={closeMediaModal} style={styles.closeButton}>
                                        <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {selectedMedia.type === 'image' ? (
                                    <Image
                                        source={{ uri: selectedMedia.url }}
                                        style={styles.modalImage}
                                        resizeMode="contain"

                                    />
                                ) : (
                                    <View style={styles.modalVideo}>
                                        <MaterialCommunityIcons name="video" size={80} color="#6B7280" />
                                        <Text style={styles.modalVideoText}>Video: {selectedMedia.url}</Text>
                                        <Text style={styles.modalVideoNote}>
                                            Trong ứng dụng thực tế, bạn có thể phát video ở đây
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </Modal>
                </Portal>
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
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 12,
    },
    stageChip: {
        alignSelf: 'flex-start',
    },
    divider: {
        marginVertical: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    infoItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        textAlign: 'center',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    noteLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginRight: 8,
    },
    noteText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        lineHeight: 20,
    },
    seasonName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    seasonInfo: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    stageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    stageCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    stageDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 8,
    },
    stageOrder: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        marginBottom: 8,
    },
    // Media styles
    mediaContainer: {
        marginTop: 8,
    },
    mediaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    mediaSection: {
        marginBottom: 16,
    },
    mediaSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    mediaItem: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    videoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    mediaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Modal styles
    modalContainer: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '90%',
    },
    modalContent: {
        padding: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    modalImage: {
        width: '100%',
        height: 400,
        backgroundColor: '#F9FAFB',
    },
    modalVideo: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        minHeight: 300,
    },
    modalVideoText: {
        fontSize: 16,
        color: '#374151',
        marginTop: 16,
        textAlign: 'center',
    },
    modalVideoNote: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
