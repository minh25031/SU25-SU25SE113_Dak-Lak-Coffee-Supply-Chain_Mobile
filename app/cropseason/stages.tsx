import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


import BackButton from '@/components/BackButton';
import { CropStageListItem, getAllCropStages } from '@/core/api/cropStage.api';
import { Snackbar } from 'react-native-paper';

interface StageItemProps {
    item: CropStageListItem;
    index: number;
}

const StageItem: React.FC<StageItemProps> = ({ item, index }) => {
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

    return (
        <View style={styles.stageItem}>
            <View style={styles.stageHeader}>
                <View style={styles.stageNumber}>
                    <Text style={styles.stageNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stageInfo}>
                    <View style={styles.stageIconContainer}>
                        <MaterialCommunityIcons
                            name={getStageIcon(item.stageCode) as any}
                            size={24}
                            color={getStageColor(item.stageCode)}
                        />
                    </View>
                    <View style={styles.stageDetails}>
                        <Text style={styles.stageName}>{item.stageNameVi || item.stageName}</Text>
                        <Text style={styles.stageCode}>{item.stageCode}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.stageFooter}>
                <View style={styles.stageMetric}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                    <Text style={styles.metricText}>{item.estimatedDuration} ngày</Text>
                </View>
                <View style={styles.stageMetric}>
                    <MaterialCommunityIcons name="sort-numeric-ascending" size={16} color="#6B7280" />
                    <Text style={styles.metricText}>Thứ tự: {item.orderIndex}</Text>
                </View>
            </View>
        </View>
    );
};

export default function CropStagesScreen() {
    const router = useRouter();

    const [stages, setStages] = useState<CropStageListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    const fetchStages = async () => {
        setLoading(true);
        try {
            const result = await getAllCropStages();
            if (result.code === 200) {
                // Sắp xếp theo thứ tự
                const sortedStages = (result.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
                setStages(sortedStages);
            } else {
                showSnackbar(result.message || 'Không thể tải danh sách giai đoạn');
            }
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách giai đoạn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStages();
    }, [fetchStages]);

    const renderStageItem = ({ item, index }: { item: CropStageListItem; index: number }) => (
        <StageItem item={item} index={index} />
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
            <Text style={styles.title}>Các giai đoạn phát triển</Text>
            <Text style={styles.subtitle}>
                Quy trình chuẩn cho cây cà phê từ gieo trồng đến thu hoạch
            </Text>

            {stages.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="leaf-off" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Chưa có thông tin giai đoạn</Text>
                    <Text style={styles.emptySubtitle}>
                        Liên hệ admin để cập nhật thông tin giai đoạn
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={stages}
                    keyExtractor={(item) => item.stageId}
                    renderItem={renderStageItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

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
        marginBottom: 8,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 20,
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
        paddingBottom: 20,
        gap: 12,
    },
    stageItem: {
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
    stageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stageNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FD7622',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stageNumberText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stageIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
    stageCode: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
    stageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    stageMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricText: {
        fontSize: 14,
        color: '#6B7280',
    },
});
