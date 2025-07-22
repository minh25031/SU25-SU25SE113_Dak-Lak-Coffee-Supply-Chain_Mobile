import BackButton from "@/components/BackButton";
import type { CropSeason } from "@/core/api/cropSeason.api";
import { getCropSeasonById } from "@/core/api/cropSeason.api";
import { getCropSeasonStatusLabel } from "@/core/enums/cropSeasonDetailStatus";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import CropSeasonDetailItem from "./components/CropSeasonDetailItem";

export default function CropSeasonDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [season, setSeason] = useState<CropSeason | null>(null);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCropSeasonById(id as string);
                setSeason(res);
            } catch (err) {
                console.error("Lỗi khi tải mùa vụ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FD7622" />
            </View>
        );
    }

    if (!season) {
        return (
            <View style={styles.centered}>
                <Text>Không tìm thấy mùa vụ.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>{season.seasonName}</Text>

            <View style={styles.infoBox}>
                <Text style={styles.label}>Thời gian:</Text>
                <Text style={styles.value}>
                    {formatDate(season.startDate)} → {formatDate(season.endDate)}
                </Text>

                <Text style={styles.label}>Diện tích:</Text>
                <Text style={styles.value}>{season.area} ha</Text>

                <Text style={styles.label}>Nông dân:</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="account" size={16} color="#6F4E37" />
                    <Text style={[styles.value, { marginLeft: 6 }]}>{season.farmerName}</Text>
                </View>

                <Text style={styles.label}>Mã đăng ký:</Text>
                <Text style={styles.value}>{season.registrationCode}</Text>

                <Text style={styles.label}>Ghi chú:</Text>
                <Text style={styles.value}>{season.note || "(Không có)"}</Text>

                <Text style={styles.label}>Trạng thái:</Text>
                <Text style={[styles.value, { color: "#FD7622" }]}>
                    {getCropSeasonStatusLabel(season.status)}
                </Text>
            </View>

            <Text style={styles.subTitle}>Vùng trồng</Text>

            {season.details.length === 0 ? (
                <Text style={styles.empty}>Chưa có vùng trồng.</Text>
            ) : (
                season.details.map((detail, index) => (
                    <CropSeasonDetailItem key={detail.detailId} index={index} {...detail} />
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#FEFAF4", flexGrow: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", color: "#D74F0F", marginBottom: 12 },
    infoBox: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        marginBottom: 24,
    },
    label: { fontSize: 14, fontWeight: "600", marginTop: 8, color: "#6F4E37" },
    value: { fontSize: 16, color: "#1F2937" },
    subTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 8,
    },
    empty: {
        fontStyle: "italic",
        color: "#9CA3AF",
        marginBottom: 12,
    },
});
