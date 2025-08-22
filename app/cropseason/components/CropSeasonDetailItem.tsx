// CropSeasonDetailItem.tsx
import { getCropSeasonDetailStatusColor, getCropSeasonDetailStatusLabel } from "@/core/enums/cropSeasonDetailStatus";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CropSeasonDetailItemProps {
    typeName: string;
    areaAllocated: number;
    expectedHarvestStart: string;
    expectedHarvestEnd: string;
    estimatedYield: number;
    plannedQuality: string;
    status: string;
    index?: number;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
};

const CropSeasonDetailItem: React.FC<CropSeasonDetailItemProps> = ({
    typeName,
    areaAllocated,
    expectedHarvestStart,
    expectedHarvestEnd,
    estimatedYield,
    plannedQuality,
    status,
    index,
}) => {
    return (
        <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>
                {index !== undefined ? `#${index + 1} - ` : ""}
                {typeName}
            </Text>

            <View style={styles.detailRow}>
                <Text style={{ fontSize: 16, color: "#3B82F6" }}>📏</Text>
                <Text style={styles.detailItem}>Diện tích: {areaAllocated} ha</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={{ fontSize: 16, color: "#F59E0B" }}>📅</Text>
                <Text style={styles.detailItem}>
                    Thu hoạch: {formatDate(expectedHarvestStart)} → {formatDate(expectedHarvestEnd)}
                </Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={{ fontSize: 16, color: "#FD7622" }}>🌽</Text>
                <Text style={styles.detailItem}>Năng suất ước tính: {estimatedYield} kg</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={{ fontSize: 16, color: "#8B5CF6" }}>🏆</Text>
                <Text style={styles.detailItem}>Chất lượng dự kiến: {plannedQuality}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text
                    style={{ fontSize: 16, color: getCropSeasonDetailStatusColor(status) }}
                >
                    🏷️
                </Text>
                <Text
                    style={[
                        styles.detailItem,
                        { color: getCropSeasonDetailStatusColor(status) },
                    ]}
                >
                    Trạng thái: {getCropSeasonDetailStatusLabel(status)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    detailCard: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FD7622",
    },
    detailTitle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#1F2937",
        marginBottom: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    detailItem: {
        fontSize: 14,
        color: "#374151",
        marginLeft: 6,
    },
});

export default CropSeasonDetailItem;
