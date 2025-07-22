import { getStatusLabel } from "@/core/utils/getStatusLabel";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CropSeasonCardProps {
    cropSeasonId: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    area: number;
    farmerName: string;
    status: string;
    onPress?: () => void;
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const CropSeasonCard: React.FC<CropSeasonCardProps> = ({
    seasonName,
    startDate,
    endDate,
    area,
    farmerName,
    status,
    onPress,
}) => {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Text style={styles.name}>{seasonName}</Text>
            <Text style={styles.date}>
                Thời gian: {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
            <Text style={styles.info}>Diện tích: {area} ha</Text>
            <View style={styles.row}>
                <MaterialCommunityIcons name="account" size={16} color="#6F4E37" />
                <Text style={styles.farmer}>{farmerName}</Text>
            </View>
            <Text style={styles.status}>Trạng thái: {getStatusLabel(status)}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
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
    info: { fontSize: 14, color: "#374151" },
    row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    farmer: { marginLeft: 6, color: "#374151" },
    status: { marginTop: 6, fontWeight: "600", color: "#FD7622" },
});

export default CropSeasonCard;
