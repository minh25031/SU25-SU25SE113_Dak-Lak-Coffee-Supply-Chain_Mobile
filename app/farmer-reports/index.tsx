import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllFarmerReports } from '../../core/api/generalFarmerReports.api';
import { GeneralFarmerReportViewAllDto } from '../../core/api/generalFarmerReports.api';
import Background from '../../components/Background';

export default function FarmerReportsListScreen() {
    const router = useRouter();
    const [reports, setReports] = useState<GeneralFarmerReportViewAllDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getAllFarmerReports();
            // Sắp xếp theo ngày mới nhất
            const sortedData = data.sort((a, b) =>
                new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
            );
            setReports(sortedData);
        } catch (error) {
            console.error('❌ Error fetching reports:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    };

    const handleCreateReport = () => {
        router.push('/farmer-reports/create');
    };

    const handleReportPress = (reportId: string) => {
        router.push(`/farmer-reports/${reportId}`);
    };

    const getSeverityColor = (level: number) => {
        switch (level) {
            case 2: return '#EF4444'; // High - Red
            case 1: return '#F59E0B'; // Medium - Yellow
            case 0: return '#3B82F6'; // Low - Blue
            default: return '#6B7280'; // Default - Gray
        }
    };

    const getSeverityText = (level: number) => {
        switch (level) {
            case 2: return 'Nghiêm trọng';
            case 1: return 'Vừa';
            case 0: return 'Nhẹ';
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

    const renderReportCard = ({ item }: { item: GeneralFarmerReportViewAllDto }) => (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={() => handleReportPress(item.reportId)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.reportTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.severityLevel !== null && item.severityLevel !== undefined && item.severityLevel >= 0 && (
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severityLevel) }]}>
                            <Text style={styles.severityText}>
                                {getSeverityText(item.severityLevel)}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.statusContainer}>
                    {item.isResolved ? (
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

            <Text style={styles.description} numberOfLines={3}>
                {item.description}
            </Text>

            <View style={styles.cardFooter}>
                <View style={styles.infoRow}>
                    <Ionicons name="leaf-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                        {getReportTypeText(item.reportType)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                        {formatDate(item.reportedAt)}
                    </Text>
                </View>

                {((item.photoFiles && item.photoFiles.length > 0) || (item.videoFiles && item.videoFiles.length > 0)) && (
                    <View style={styles.infoRow}>
                        <Ionicons name="attach-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>
                            {(item.photoFiles ? item.photoFiles.length : 0) + (item.videoFiles ? item.videoFiles.length : 0)} tệp đính kèm
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <Background>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang tải danh sách báo cáo...</Text>
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Tư vấn kỹ thuật</Text>
                        <Text style={styles.headerSubtitle}>
                            Báo cáo vấn đề kỹ thuật và nhận tư vấn từ chuyên gia
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateReport}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statNumber}>{reports.length}</Text>
                            <Text style={styles.statLabel}>Tổng báo cáo</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statNumber}>
                                {reports.filter(r => r.isResolved).length}
                            </Text>
                            <Text style={styles.statLabel}>Đã xử lý</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons name="time-outline" size={24} color="#F59E0B" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statNumber}>
                                {reports.filter(r => !r.isResolved).length}
                            </Text>
                            <Text style={styles.statLabel}>Chờ xử lý</Text>
                        </View>
                    </View>
                </View>

                {/* Reports List */}
                <FlatList
                    data={reports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item.reportId}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>Chưa có báo cáo nào</Text>
                            <Text style={styles.emptySubtitle}>
                                Tạo báo cáo đầu tiên để nhận tư vấn kỹ thuật
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={handleCreateReport}
                            >
                                <Text style={styles.emptyButtonText}>Tạo báo cáo mới</Text>
                            </TouchableOpacity>
                        </View>
                    }
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
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
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
    createButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
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
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statContent: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    listContainer: {
        padding: 16,
    },
    reportCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    severityText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    resolvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    resolvedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
        marginLeft: 4,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
        marginLeft: 4,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#6B7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 64,
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
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    emptyButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
