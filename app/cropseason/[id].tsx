import BackButton from "@/components/BackButton";
import type { CropSeason } from "@/core/api/cropSeason.api";
import { getCropSeasonById } from "@/core/api/cropSeason.api";
import { getCropSeasonStatusLabel } from "@/core/enums/cropSeasonDetailStatus";

// import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
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
                setSeason(res?.data || null);
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
                <Text style={{ color: "#6B7280" }}>Không tìm thấy mùa vụ.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>{season.seasonName}</Text>

            <View style={styles.infoBox}>
                <InfoRow label="Thời gian:" value={`${formatDate(season.startDate)} → ${formatDate(season.endDate)}`} />
                <InfoRow label="Diện tích:" value={`${season.area} ha`} />
                <InfoRow
                    label="Nông dân:"
                    value={season.farmerName}
                    icon={<Text style={{ fontSize: 16, color: "#6F4E37" }}>👤</Text>}
                />
                <InfoRow label="Mã đăng ký:" value={season.registrationCode} />
                <InfoRow label="Ghi chú:" value={season.note || "(Không có)"} />
                <InfoRow label="Trạng thái:" value={getCropSeasonStatusLabel(season.status)} highlight />
            </View>

            <Text style={styles.subTitle}>🌱 Vùng trồng</Text>

            {season.details.length === 0 ? (
                <Text style={styles.empty}>Chưa có vùng trồng nào.</Text>
            ) : (
                season.details.map((detail, index) => (
                    <View key={detail.detailId} style={styles.detailItemWrapper}>
                        <CropSeasonDetailItem index={index} {...detail} />
                        <TouchableOpacity
                            style={styles.progressButton}
                            onPress={() => router.push(`/cropseason/${id}/progress?detailId=${detail.detailId}`)}
                        >
                            <Text style={styles.progressButtonText}>⏰ Xem tiến độ</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const InfoRow = ({
    label,
    value,
    icon,
    highlight = false,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    highlight?: boolean;
}) => (
    <View style={{ marginTop: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
            <Text style={[styles.value, highlight && { color: "#FD7622", fontWeight: "bold" }]}>
                {value}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#FEFAF4", flexGrow: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
    title: { fontSize: 22, fontWeight: "bold", color: "#D74F0F", marginBottom: 12 },
    infoBox: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        marginBottom: 24,
    },
    label: { fontSize: 14, fontWeight: "600", color: "#6F4E37" },
    value: { fontSize: 16, color: "#1F2937" },
    subTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 12,
    },
    empty: {
        fontStyle: "italic",
        color: "#9CA3AF",
        marginBottom: 12,
    },
    detailItemWrapper: {
        marginBottom: 12,
    },
    progressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    progressButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D97706',
        marginLeft: 8,
    },
});
