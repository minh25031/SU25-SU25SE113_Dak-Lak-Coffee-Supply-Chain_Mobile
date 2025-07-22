import BackButton from "@/components/BackButton";
import { getAllCropSeasons } from "@/core/api/cropSeason.api";
import { CropSeasonStatus, CropSeasonStatusLabels } from "@/core/enums/CropSeasonStatus";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import CropSeasonCard from "./components/CropSeasonCard";

interface CropSeason {
    cropSeasonId: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    area: number;
    farmerName: string;
    status: string;
}

export default function CropSeasonListScreen() {
    const [data, setData] = useState<CropSeason[]>([]);
    const [filteredData, setFilteredData] = useState<CropSeason[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Dropdown: Trạng thái
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
    const [statusItems, setStatusItems] = useState([
        { label: "Tất cả", value: "all" },
        ...Object.values(CropSeasonStatus).map((status) => ({
            label: CropSeasonStatusLabels[status],
            value: status,
        })),
    ]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllCropSeasons();
                setData(response);
                setFilteredData(response);
            } catch (error: any) {
                console.error("Lỗi khi tải mùa vụ:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = data.filter((item) => {
            return selectedStatus === "all" || item.status === selectedStatus;
        });
        setFilteredData(filtered);
    }, [selectedStatus, data]);

    const renderItem = ({ item }: { item: CropSeason }) => (
        <CropSeasonCard
            seasonName={item.seasonName}
            startDate={item.startDate}
            endDate={item.endDate}
            area={item.area}
            farmerName={item.farmerName}
            status={item.status}
            onPress={() => router.push(`/cropseason/${item.cropSeasonId}`)} cropSeasonId={""} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FEFAF4", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", color: "#D74F0F", marginBottom: 12 },
    dropdownContainer: {
        zIndex: 10,
        marginBottom: 16,
    },
    dropdown: {
        marginBottom: 8,
        borderColor: "#D6D3D1",
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    name: { fontSize: 18, fontWeight: "bold", color: "#374151", marginBottom: 6 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    rowText: {
        marginLeft: 6,
        color: "#374151",
        fontSize: 14,
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
