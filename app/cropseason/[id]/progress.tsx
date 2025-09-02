import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Divider, Chip, FAB, Button } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason } from '@/core/api/cropSeason.api';
import { getCropProgressesByDetailId, CropProgressViewAllDto } from '@/core/api/cropProgress.api';
import { getCropStages, CropStage } from '@/core/api/cropStage.api';

export default function CropProgressScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;

    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [progresses, setProgresses] = useState<CropProgressViewAllDto[]>([]);
    const [stages, setStages] = useState<CropStage[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        if (!cropSeasonId) return;

        try {
            setLoading(true);

            // Load crop season info
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
            }

            // Load crop stages
            const cropStages = await getCropStages();
            setStages(cropStages);

            // Load progresses for all details
            if (season?.details) {
                const allProgresses: CropProgressViewAllDto[] = [];
                for (const detail of season.details) {
                    try {
                        const detailProgresses = await getCropProgressesByDetailId(detail.detailId);
                        allProgresses.push(...detailProgresses);
                    } catch (error) {
                        console.error(`Error loading progress for detail ${detail.detailId}:`, error);
                        // Không dừng loading nếu một detail bị lỗi
                    }
                }
                setProgresses(allProgresses);
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
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    }, [cropSeasonId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleAddProgress = () => {
        if (cropSeason?.details && cropSeason.details.length > 0) {
            // Nếu có nhiều detail, cho user chọn
            if (cropSeason.details.length === 1) {
                router.push(`/cropseason/${cropSeasonId}/progress/create?detailId=${cropSeason.details[0].detailId}`);
            } else {
                // TODO: Hiển thị dialog chọn detail
                Alert.alert('Chọn vùng trồng', 'Vui lòng chọn vùng trồng để thêm tiến độ');
            }
        } else {
            Alert.alert('Không có vùng trồng', 'Mùa vụ này chưa có vùng trồng nào');
        }
    };

    const handleViewProgress = (progressId: string) => {
        router.push(`/cropseason/${cropSeasonId}/progress/${progressId}`);
    };

    const handleEditProgress = (progressId: string) => {
        router.push(`/cropseason/${cropSeasonId}/progress/${progressId}/edit`);
    };

    const getStageName = (stageId: number): string => {
        const stage = stages.find(s => s.stageId === stageId);
        return stage?.stageName || `Giai đoạn ${stageId}`;
    };

    const getStageColor = (stageId: number): string => {
        const stage = stages.find(s => s.stageId === stageId);
        if (!stage) return '#6B7280';

        // Màu sắc dựa trên thứ tự giai đoạn
        const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];
        return colors[stage.orderIndex % colors.length];
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
                    <Text>Đang tải...</Text>
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
                    <Text style={styles.headerTitle}>Tiến độ trồng trọt</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FD7622"]}
                            tintColor="#FD7622"
                        />
                    }
                >
                    {/* Season Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>{cropSeason.seasonName}</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.seasonInfo}>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="calendar-range" size={16} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Thời gian:</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(cropSeason.startDate)} - {formatDate(cropSeason.endDate)}
                                    </Text>
                                </View>

                                {cropSeason.area && (
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                                        <Text style={styles.infoLabel}>Diện tích:</Text>
                                        <Text style={styles.infoValue}>{cropSeason.area} ha</Text>
                                    </View>
                                )}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Progress Summary Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Tổng quan tiến độ</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>{progresses.length}</Text>
                                    <Text style={styles.summaryLabel}>Bản ghi tiến độ</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>
                                        {cropSeason.details?.length || 0}
                                    </Text>
                                    <Text style={styles.summaryLabel}>Vùng trồng</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>
                                        {stages.length}
                                    </Text>
                                    <Text style={styles.summaryLabel}>Giai đoạn</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Progress List Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Danh sách tiến độ</Text>
                            <Divider style={styles.divider} />

                            {progresses.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="chart-line" size={48} color="#9CA3AF" />
                                    <Text style={styles.emptyText}>Chưa có tiến độ nào</Text>
                                    <Text style={styles.emptySubText}>
                                        Hãy thêm tiến độ đầu tiên để theo dõi quá trình trồng trọt
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.progressList}>
                                    {progresses.map((progress, index) => (
                                        <View key={progress.progressId} style={styles.progressItem}>
                                            <View style={styles.progressHeader}>
                                                <View style={styles.progressInfo}>
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
                                                    <Text style={styles.progressDate}>
                                                        {formatDate(progress.progressDate || '')}
                                                    </Text>
                                                </View>

                                                <View style={styles.progressActions}>
                                                    <TouchableOpacity
                                                        style={styles.actionButton}
                                                        onPress={() => handleViewProgress(progress.progressId)}
                                                    >
                                                        <MaterialCommunityIcons name="eye" size={20} color="#3B82F6" />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.actionButton}
                                                        onPress={() => handleEditProgress(progress.progressId)}
                                                    >
                                                        <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {progress.note && (
                                                <Text style={styles.progressNote} numberOfLines={2}>
                                                    {progress.note}
                                                </Text>
                                            )}

                                            {progress.actualYield && (
                                                <View style={styles.yieldInfo}>
                                                    <MaterialCommunityIcons name="scale" size={16} color="#6B7280" />
                                                    <Text style={styles.yieldText}>
                                                        Sản lượng: {progress.actualYield} kg
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Stages Info Card */}
                    {stages.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Các giai đoạn trồng trọt</Text>
                                <Divider style={styles.divider} />

                                <View style={styles.stagesList}>
                                    {stages.map((stage, index) => (
                                        <View key={stage.stageId} style={styles.stageItem}>
                                            <View style={styles.stageNumber}>
                                                <Text style={styles.stageNumberText}>{index + 1}</Text>
                                            </View>
                                            <View style={styles.stageInfo}>
                                                <Text style={styles.stageName}>{stage.stageName}</Text>
                                                {stage.description && (
                                                    <Text style={styles.stageDescription} numberOfLines={2}>
                                                        {stage.description}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>

                {/* FAB for Add Progress */}
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={handleAddProgress}
                    label="Thêm tiến độ"
                />
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
    divider: {
        marginVertical: 16,
    },
    seasonInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        minWidth: 70,
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FD7622',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    progressList: {
        gap: 12,
    },
    progressItem: {
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#E5E7EB',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    progressInfo: {
        flex: 1,
        gap: 8,
    },
    stageChip: {
        alignSelf: 'flex-start',
    },
    progressDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    progressNote: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 8,
    },
    yieldInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    yieldText: {
        fontSize: 12,
        color: '#6B7280',
    },
    stagesList: {
        gap: 12,
    },
    stageItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    stageNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FD7622',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stageNumberText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    stageInfo: {
        flex: 1,
    },
    stageName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    stageDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#FD7622',
    },
});
