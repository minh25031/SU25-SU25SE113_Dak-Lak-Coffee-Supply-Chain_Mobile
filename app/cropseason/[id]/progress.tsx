import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import BackButton from '@/components/BackButton';
import { CropProgressListItem, getCropProgressBySeasonDetail, deleteCropProgress } from '@/core/api/cropProgress.api';
import { CropStageListItem, getAllCropStages } from '@/core/api/cropStage.api';
import { Snackbar } from 'react-native-paper';

interface ProgressItemProps {
    item: CropProgressListItem;
    onEdit: () => void;
    onDelete: () => void;
}

const ProgressItem: React.FC<ProgressItemProps> = ({ item, onEdit, onDelete }) => {
    const getStageIcon = (stageCode: string) => {
        switch (stageCode.toUpperCase()) {
            case 'PLANTING':
                return 'sprout';
            case 'FLOWERING':
                return 'flower';
            case 'FRUITING':
                return 'fruit-cherries';
            case 'RIPENING':
                return 'trending-up';
            case 'HARVESTING':
                return 'basket';
            default:
                return 'help-circle';
        }
    };

    const getStageColor = (stageCode: string) => {
        switch (stageCode.toUpperCase()) {
            case 'PLANTING':
                return '#10B981';
            case 'FLOWERING':
                return '#EC4899';
            case 'FRUITING':
                return '#EF4444';
            case 'RIPENING':
                return '#F59E0B';
            case 'HARVESTING':
                return '#D97706';
            default:
                return '#6B7280';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return 'N/A';
        }
    };

    return (
        <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
                <View style={styles.stageInfo}>
                    <View style={[styles.stageIcon, { backgroundColor: getStageColor(item.stageCode) + '20' }]}>
                        <MaterialCommunityIcons
                            name={getStageIcon(item.stageCode) as any}
                            size={20}
                            color={getStageColor(item.stageCode)}
                        />
                    </View>
                    <View style={styles.stageDetails}>
                        <Text style={styles.stageName}>{item.stageName}</Text>
                        <Text style={styles.progressDate}>{formatDate(item.progressDate)}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                        <MaterialCommunityIcons name="pencil" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                        <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            {item.imageUrl && (
                <View style={styles.mediaContainer}>
                    <MaterialCommunityIcons name="image" size={16} color="#6B7280" />
                    <Text style={styles.mediaText}>Có hình ảnh</Text>
                </View>
            )}

            {item.videoUrl && (
                <View style={styles.mediaContainer}>
                    <MaterialCommunityIcons name="video" size={16} color="#6B7280" />
                    <Text style={styles.mediaText}>Có video</Text>
                </View>
            )}
        </View>
    );
};

export default function CropProgressScreen() {
    const { id, detailId } = useLocalSearchParams<{ id: string; detailId: string }>();
    const router = useRouter();

    const [progressList, setProgressList] = useState<CropProgressListItem[]>([]);
    const [stages, setStages] = useState<CropStageListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [progressRes, stagesRes] = await Promise.all([
                getCropProgressBySeasonDetail(detailId),
                getAllCropStages()
            ]);

            if (progressRes.code === 200) {
                setProgressList(progressRes.data || []);
            }

            if (stagesRes.code === 200) {
                setStages(stagesRes.data || []);
            }
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu tiến độ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (detailId) {
            fetchData();
        }
    }, [detailId]);

    const handleAddProgress = () => {
        router.push(`/cropseason/${id}/progress/create?detailId=${detailId}`);
    };

    const handleEditProgress = (progressId: string) => {
        router.push(`/cropseason/${id}/progress/edit/${progressId}?detailId=${detailId}`);
    };

    const handleDeleteProgress = (progressId: string) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc muốn xóa tiến độ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteCropProgress(progressId);
                            if (result.code === 200) {
                                showSnackbar('Đã xóa tiến độ thành công');
                                fetchData();
                            } else {
                                showSnackbar(result.message || 'Xóa thất bại');
                            }
                        } catch (error) {
                            showSnackbar('Lỗi khi xóa tiến độ');
                        }
                    },
                },
            ]
        );
    };

    const renderProgressItem = ({ item }: { item: CropProgressListItem }) => (
        <ProgressItem
            item={item}
            onEdit={() => handleEditProgress(item.progressId)}
            onDelete={() => handleDeleteProgress(item.progressId)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FD7622" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Tiến độ mùa vụ</Text>

            {progressList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="leaf-off" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Chưa có tiến độ nào</Text>
                    <Text style={styles.emptySubtitle}>
                        Bắt đầu ghi lại tiến độ phát triển của cây cà phê
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={progressList}
                    keyExtractor={(item) => item.progressId}
                    renderItem={renderProgressItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddProgress}>
                <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Thêm tiến độ</Text>
            </TouchableOpacity>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Đóng',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D74F0F',
        marginBottom: 20,
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEFAF4',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        paddingBottom: 100,
        gap: 12,
    },
    progressItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stageIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stageDetails: {
        flex: 1,
    },
    stageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    progressDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    mediaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    mediaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FD7622',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
