import BackButton from "@/components/BackButton";
import {
    CropSeasonListItem,
    deleteCropSeasonById,
    getAllCropSeasons,
    getCropSeasonsForCurrentUser,
} from "@/core/api/cropSeason.api";
import {
    CropSeasonStatus,
    CropSeasonStatusLabels,
} from "@/core/enums/CropSeasonStatus";
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
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Snackbar } from "react-native-paper";
import CropSeasonCard from "./components/CropSeasonCard";

export default function CropSeasonListScreen() {
    const [data, setData] = useState<CropSeasonListItem[]>([]);
    const [filteredData, setFilteredData] = useState<CropSeasonListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
    const [statusItems, setStatusItems] = useState([
        { label: "Tất cả", value: "all" },
        ...Object.values(CropSeasonStatus).map((status) => ({
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
        setLoading(true);
        try {
            console.log('🔄 Đang tải danh sách mùa vụ...');
            // Sử dụng API dành cho farmer
            const response = await getCropSeasonsForCurrentUser();
            console.log('📡 API Response:', response);
            console.log('📡 Response data:', response.data);
            console.log('📡 Response code:', response.code);

            if (response.code === 200 && response.data) {
                setData(response.data);
                setFilteredData(response.data);
                console.log('✅ Dữ liệu mùa vụ đã được set:', response.data.length, 'items');
            } else {
                console.log('⚠️ Response không thành công:', response);
                setData([]);
                setFilteredData([]);
            }
        } catch (error: any) {
            console.error('❌ Lỗi khi tải mùa vụ:', error);
            showSnackbar("Lỗi khi tải danh sách mùa vụ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const filtered = data.filter(
                (item) => selectedStatus === "all" || item.status === selectedStatus
            );
            setFilteredData(filtered);
        }
    }, [selectedStatus, data]);

    const handleDelete = (id: string) => {
        Alert.alert("Xác nhận xoá", "Bạn có chắc muốn xoá mùa vụ này?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá",
                style: "destructive",
                onPress: async () => {
                    const res = await deleteCropSeasonById(id);
                    if (res.code === 200) {
                        showSnackbar("Đã xoá mùa vụ.");
                        fetchData(); // làm mới dữ liệu
                    } else {
                        showSnackbar(res.message || "Xoá thất bại.");
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: CropSeasonListItem }) => (
        <CropSeasonCard
            cropSeasonId={item.cropSeasonId}
            seasonName={item.seasonName}
            startDate={item.startDate}
            endDate={item.endDate}
            area={item.area}
            farmerName={item.farmerName}
            status={item.status}
            onPress={() => router.push(`/cropseason/${item.cropSeasonId}`)}
            onEdit={() => router.push(`/cropseason/update/${item.cropSeasonId}`)}
            onDelete={() => handleDelete(item.cropSeasonId)}
        />
    );

    return (
        <View style={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Danh sách mùa vụ</Text>

            <DropDownPicker
                open={statusOpen}
                value={selectedStatus}
                items={statusItems}
                setOpen={setStatusOpen}
                setValue={setSelectedStatus}
                setItems={setStatusItems}
                placeholder="Chọn trạng thái"
                style={styles.dropdown}
                textStyle={{ fontSize: 14 }}
                zIndex={1000}
                zIndexInverse={1000}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FD7622" />
                </View>
            ) : (
                <>
                    {filteredData.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Không có mùa vụ nào.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.cropSeasonId}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </>
            )}

            <View style={styles.bottomButtons}>
                <Pressable
                    style={[styles.bottomButton, styles.stagesButton]}
                    onPress={() => router.push("/cropseason/stages")}
                >
                    <Text style={styles.stagesButtonText}>⏰ Giai đoạn</Text>
                </Pressable>

                <Pressable
                    style={[styles.bottomButton, styles.addButton]}
                    onPress={() => router.push("/cropseason/create")}
                >
                    <Text style={styles.addButtonText}>+ Thêm mùa vụ</Text>
                </Pressable>
            </View>

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
        backgroundColor: "#FEFAF4",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#D74F0F",
        marginBottom: 12,
    },
    dropdown: {
        marginBottom: 16,
        borderColor: "#D6D3D1",
        zIndex: 1000,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
    },
    listContent: {
        paddingBottom: 100,
        gap: 12,
    },
    bottomButtons: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: "row",
        gap: 12,
    },
    bottomButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    stagesButton: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    stagesButtonText: {
        color: "#6B7280",
        fontWeight: "600",
        fontSize: 14,
    },
    addButton: {
        backgroundColor: "#FD7622",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
