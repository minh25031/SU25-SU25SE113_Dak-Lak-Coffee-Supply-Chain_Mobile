import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider, Chip, FAB } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { getCropSeasonById, CropSeason, CropSeasonStatusValue, CropSeasonStatusLabels } from '@/core/api/cropSeason.api';
import { getCropSeasonDetailsBySeasonId, CropSeasonDetail } from '@/core/api/cropSeasonDetail.api';

export default function CropSeasonDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const cropSeasonId = id as string;

    const [loading, setLoading] = useState(true);
    const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
    const [details, setDetails] = useState<CropSeasonDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const loadCropSeason = useCallback(async () => {
        if (!cropSeasonId) return;

        try {
            setLoading(true);
            const season = await getCropSeasonById(cropSeasonId);
            if (season) {
                setCropSeason(season);
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin mùa vụ');
                router.back();
            }
        } catch (error) {
            console.error('❌ Error loading crop season:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tải thông tin mùa vụ. Vui lòng kiểm tra kết nối mạng và thử lại.',
                [
                    {
                        text: 'Thử lại',
                        onPress: () => loadCropSeason()
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
    }, [cropSeasonId, router]);

    useFocusEffect(
        useCallback(() => {
            loadCropSeason();
        }, [loadCropSeason])
    );

    const getStatusColor = (status: CropSeasonStatusValue) => {
        switch (status) {
            case CropSeasonStatusValue.Active:
                return '#10B981';
            case CropSeasonStatusValue.Paused:
                return '#F59E0B';
            case CropSeasonStatusValue.Completed:
                return '#3B82F6';
            case CropSeasonStatusValue.Cancelled:
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusBackgroundColor = (status: CropSeasonStatusValue) => {
        switch (status) {
            case CropSeasonStatusValue.Active:
                return '#D1FAE5';
            case CropSeasonStatusValue.Paused:
                return '#FEF3C7';
            case CropSeasonStatusValue.Completed:
                return '#DBEAFE';
            case CropSeasonStatusValue.Cancelled:
                return '#FEE2E2';
            default:
                return '#F3F4F6';
        }
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

    const canEdit = cropSeason.status !== CropSeasonStatusValue.Completed &&
        cropSeason.status !== CropSeasonStatusValue.Cancelled;

    return (
        <Background>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton goBack={() => router.back()} />
                    <Text style={styles.headerTitle}>Chi tiết mùa vụ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Basic Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.titleRow}>
                                <Text style={styles.seasonName}>{cropSeason.seasonName}</Text>
                                <Chip
                                    mode="outlined"
                                    style={[
                                        styles.statusChip,
                                        {
                                            backgroundColor: getStatusBackgroundColor(cropSeason.status),
                                            borderColor: getStatusColor(cropSeason.status)
                                        }
                                    ]}
                                    textStyle={{ color: getStatusColor(cropSeason.status) }}
                                >
                                    {CropSeasonStatusLabels[cropSeason.status]}
                                </Chip>
                            </View>

                            {cropSeason.description && cropSeason.description.trim() !== '' && (
                                <Text style={styles.description}>{cropSeason.description}</Text>
                            )}

                            <Divider style={styles.divider} />

                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="calendar-start" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Bắt đầu</Text>
                                    <Text style={styles.infoValue}>{formatDate(cropSeason.startDate)}</Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="calendar-end" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Kết thúc</Text>
                                    <Text style={styles.infoValue}>{formatDate(cropSeason.endDate)}</Text>
                                </View>

                                {cropSeason.area && cropSeason.area > 0 && (
                                    <View style={styles.infoItem}>
                                        <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
                                        <Text style={styles.infoLabel}>Diện tích</Text>
                                        <Text style={styles.infoValue}>{cropSeason.area} ha</Text>
                                    </View>
                                )}

                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
                                    <Text style={styles.infoLabel}>Nông dân</Text>
                                    <Text style={styles.infoValue}>{cropSeason.farmerName || 'N/A'}</Text>
                                </View>
                            </View>

                            {cropSeason.note && cropSeason.note.trim() !== '' && (
                                <>
                                    <Divider style={styles.divider} />
                                    <View style={styles.noteContainer}>
                                        <MaterialCommunityIcons name="note-text" size={20} color="#6B7280" />
                                        <Text style={styles.noteLabel}>Ghi chú:</Text>
                                        <Text style={styles.noteText}>{cropSeason.note}</Text>
                                    </View>
                                </>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Details Card */}
                    {cropSeason.details && cropSeason.details.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Chi tiết vùng trồng</Text>
                                <Divider style={styles.divider} />

                                {cropSeason.details.map((detail, index) => (
                                    <View key={detail.detailId} style={styles.detailItem}>
                                        <View style={styles.detailHeader}>
                                            <Text style={styles.detailName}>{detail.typeName || 'N/A'}</Text>
                                            <Text style={styles.detailArea}>{detail.areaAllocated || 0} ha</Text>
                                        </View>

                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailText}>
                                                Dự kiến thu hoạch: {formatDate(detail.expectedHarvestStart)} - {formatDate(detail.expectedHarvestEnd)}
                                            </Text>
                                            <Text style={styles.detailText}>
                                                Sản lượng dự kiến: {detail.estimatedYield || 0} kg
                                            </Text>
                                            {detail.actualYield && (
                                                <Text style={styles.detailText}>
                                                    Sản lượng thực tế: {detail.actualYield} kg
                                                </Text>
                                            )}
                                            <Text style={styles.detailText}>
                                                Chất lượng: {detail.plannedQuality || 'N/A'}
                                            </Text>
                                        </View>

                                        {/* Edit Button for Detail */}
                                        <View style={styles.detailActions}>
                                            <Button
                                                mode="outlined"
                                                onPress={() => router.push(`/cropseason/${cropSeasonId}/details/${detail.detailId}/edit`)}
                                                style={styles.editDetailButton}
                                                icon={() => <MaterialCommunityIcons name="pencil" size={16} color="#6B7280" />}
                                            >
                                                Sửa
                                            </Button>

                                            {/* Progress Button for Detail */}
                                            <Button
                                                mode="contained"
                                                onPress={() => router.push(`/cropseason/${cropSeasonId}/progress?detailId=${detail.detailId}`)}
                                                style={[styles.progressDetailButton, { backgroundColor: '#3B82F6' }]}
                                                icon={() => <MaterialCommunityIcons name="chart-line" size={16} color="#FFFFFF" />}
                                            >
                                                Tiến độ
                                            </Button>
                                        </View>
                                    </View>
                                ))}
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>


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
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    seasonName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 12,
    },
    statusChip: {
        alignSelf: 'flex-start',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
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
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    detailItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    detailArea: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    detailInfo: {
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailActions: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-end',
    },
    editDetailButton: {
        marginTop: 8,
        backgroundColor: '#E0E7FF',
        borderColor: '#C7D2FE',
        borderWidth: 1,
    },
    progressDetailButton: {
        marginTop: 8,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#FD7622',
    },
});
