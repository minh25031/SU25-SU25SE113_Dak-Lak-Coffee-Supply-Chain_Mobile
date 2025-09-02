import BackButton from "@/components/BackButton";
import {
    CropSeasonListItem,
    getCropSeasonsForCurrentUser,
    CropSeasonStatusValue,
    CropSeasonStatusLabels,
} from "@/core/api/cropSeason.api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Snackbar, FAB } from "react-native-paper";
import CropSeasonCard from "./components/CropSeasonCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CropSeasonListScreen() {
    const [data, setData] = useState<CropSeasonListItem[]>([]);
    const [filteredData, setFilteredData] = useState<CropSeasonListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

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

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    const fetchData = async () => {
        try {
            console.log('🔄 Đang tải danh sách mùa vụ...');

            // Kiểm tra authentication trước khi gọi API
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.error('❌ Không có auth token');
                showSnackbar("Vui lòng đăng nhập lại.");
                router.replace('/(auth)/login');
                return;
            }

            const response = await getCropSeasonsForCurrentUser();
            console.log('📡 API Response processed:', response);

            // Response đã được xử lý trong API function, luôn là array
            setData(response);
            setFilteredData(response);
            console.log('✅ Dữ liệu mùa vụ đã được set:', response.length, 'items');
        } catch (error: any) {
            console.error('❌ Lỗi khi tải mùa vụ:', error);

            // Xử lý lỗi authentication
            if (error.response?.status === 401) {
                showSnackbar("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                router.replace('/(auth)/login');
                return;
            }

            // Xử lý lỗi 400
            if (error.response?.status === 400) {
                showSnackbar("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                return;
            }

            showSnackbar("Lỗi khi tải danh sách mùa vụ.");
            setData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const filtered = data.filter(
                (item) => selectedStatus === "all" || item.status === selectedStatus
            );

            // Sắp xếp mùa vụ theo thứ tự ưu tiên: Active -> Paused -> Completed -> Cancelled
            const sortedData = [...filtered].sort((a, b) => {
                const statusPriority = {
                    'Active': 1,      // Đang hoạt động - ưu tiên cao nhất
                    'Paused': 2,      // Tạm dừng
                    'Completed': 3,   // Hoàn thành
                    'Cancelled': 4    // Đã hủy - ưu tiên thấp nhất
                };

                const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 5;
                const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 5;

                return priorityA - priorityB;
            });

            setFilteredData(sortedData);
        }
    }, [selectedStatus, data]);

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
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FD7622" />
                <Text style={styles.loadingText}>Đang tải danh sách mùa vụ...</Text>
            </View>
        );
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
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={handleCreate}
                label="Tạo mùa vụ"
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
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#FD7622',
    },
});
