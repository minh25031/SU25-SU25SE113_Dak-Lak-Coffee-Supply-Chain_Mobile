import BackButton from "@/components/BackButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useCropSeason } from "@/core/hooks/useCropSeason";
import { CropSeasonStatusValue, CropSeasonStatusLabels } from "@/core/api/cropSeason.api";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Snackbar } from "react-native-paper";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import CropSeasonCard from "./components/CropSeasonCard";

export default function CropSeasonListScreen() {
    const router = useRouter();
    const { cropSeasons, loading, refreshing, error, onRefresh } = useCropSeason();

    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
    const [statusItems, setStatusItems] = useState([
        { label: "Tất cả", value: "all" },
        ...Object.values(CropSeasonStatusValue).map((status) => ({
            label: CropSeasonStatusLabels[status],
            value: status,
        })),
    ]);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const showSnackbar = useCallback((msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    }, []);

    // Filter and sort data based on selected status
    const filteredData = React.useMemo(() => {
        if (!cropSeasons || !Array.isArray(cropSeasons)) return [];

        const filtered = cropSeasons.filter(
            (item) => selectedStatus === "all" || item.status === selectedStatus
        );

        // Sort by priority: Active -> Paused -> Completed -> Cancelled
        return filtered.sort((a, b) => {
            const statusPriority = {
                'Active': 1,
                'Paused': 2,
                'Completed': 3,
                'Cancelled': 4
            };

            const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 5;
            const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 5;

            return priorityA - priorityB;
        });
    }, [cropSeasons, selectedStatus]);

    const handleEdit = (id: string) => {
        router.push(`/cropseason/${id}/edit`);
    };

    const handleViewDetails = (id: string) => {
        router.push(`/cropseason/${id}`);
    };

    const handleCreate = () => {
        router.push('/cropseason/create');
    };

    const renderItem = ({ item }: { item: CropSeasonListItem }) => (
        <CropSeasonCard
            item={item}
            onEdit={() => handleEdit(item.cropSeasonId)}
            onViewDetails={() => handleViewDetails(item.cropSeasonId)}
        />
    );

    if (loading) {
        return <LoadingSpinner message="Đang tải danh sách mùa vụ..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={onRefresh} />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <BackButton goBack={() => router.back()} />
                <Text style={styles.headerTitle}>Mùa vụ</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
                <DropDownPicker
                    open={statusOpen}
                    value={selectedStatus}
                    items={statusItems}
                    setOpen={setStatusOpen}
                    setValue={setSelectedStatus}
                    setItems={setStatusItems}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    placeholder="Chọn trạng thái"
                    zIndex={3000}
                    zIndexInverse={1000}
                />
            </View>

            {/* Content */}
            {filteredData.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không có mùa vụ nào</Text>
                    <Text style={styles.emptySubText}>
                        {selectedStatus === "all"
                            ? "Bạn chưa có mùa vụ nào. Hãy tạo mùa vụ đầu tiên!"
                            : `Không có mùa vụ nào với trạng thái "${selectedStatus !== "all" && CropSeasonStatusLabels[selectedStatus as CropSeasonStatusValue] || "không xác định"}"`
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.cropSeasonId}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FD7622"]}
                            tintColor="#FD7622"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB for Create */}
            <FloatingActionButton
                icon="plus"
                onPress={handleCreate}
                size="large"
                style={styles.fab}
            />

            {/* Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: "Đóng",
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
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
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
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    dropdown: {
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    dropdownContainer: {
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
});
