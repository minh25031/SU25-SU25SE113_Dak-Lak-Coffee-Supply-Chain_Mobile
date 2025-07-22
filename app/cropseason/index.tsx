import BackButton from "@/components/BackButton";
import {
    CropSeasonListItem,
    deleteCropSeasonById,
    getAllCropSeasons,
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
            const response = await getAllCropSeasons();
            setData(response);
            setFilteredData(response);
        } catch (error: any) {
            showSnackbar("Lỗi khi tải danh sách mùa vụ.");
            console.error("Lỗi khi tải mùa vụ:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = data.filter(
            (item) => selectedStatus === "all" || item.status === selectedStatus
        );
        setFilteredData(filtered);
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

            <View style={styles.dropdownContainer}>
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
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FD7622" />
            ) : (
                <>
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.cropSeasonId}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                    <Pressable
                        style={styles.addButton}
                        onPress={() => router.push("/cropseason/create")}
                    >
                        <Text style={styles.addButtonText}>+ Thêm mùa vụ</Text>
                    </Pressable>
                </>
            )}

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
    container: { flex: 1, backgroundColor: "#FEFAF4", padding: 16 },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#D74F0F",
        marginBottom: 12,
    },
    dropdownContainer: {
        zIndex: 1000,
        marginBottom: 16,
    },
    dropdown: {
        marginBottom: 8,
        borderColor: "#D6D3D1",
    },
    addButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#FD7622",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 999,
        elevation: 5,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
