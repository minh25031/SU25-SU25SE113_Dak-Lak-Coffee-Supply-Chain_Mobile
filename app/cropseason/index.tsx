import { getAllCropSeasons } from "@/core/api/cropSeason.api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

// 🧾 Định nghĩa kiểu dữ liệu cho mùa vụ
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
    const [loading, setLoading] = useState(true);
    const router = useRouter();
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
            } catch (error: any) {
                console.error("Lỗi khi tải mùa vụ:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderItem = ({ item }: { item: CropSeason }) => (
        <Pressable style={styles.card}>
            <Text style={styles.name}>{item.seasonName}</Text>
            <Text style={styles.date}>
                Thời gian: {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
            <Text>Diện tích: {item.area} ha</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <MaterialCommunityIcons name="account" size={16} color="#6F4E37" />
                <Text style={{ marginLeft: 6, color: "#374151" }}>{item.farmerName}</Text>
            </View>

            <Text>Trạng thái: {item.status}</Text>
        </Pressable>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.title}>🌾 Danh sách mùa vụ</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FD7622" />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.cropSeasonId}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FEFAF4", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", color: "#D74F0F", marginBottom: 12 },
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
    name: { fontSize: 18, fontWeight: "bold", color: "#374151" },
    date: { fontSize: 14, color: "#6F4E37", marginBottom: 4 },
    area: { fontSize: 14, color: "#1F2937" },
    status: { marginTop: 6, fontWeight: "600", color: "#FD7622" },
});
