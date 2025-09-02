import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CropSeasonListItem, CropSeasonStatusValue, CropSeasonStatusLabels } from '@/core/api/cropSeason.api';

interface CropSeasonCardProps {
    item: CropSeasonListItem;
    onEdit: () => void;
    onViewDetails: () => void;
}

export default function CropSeasonCard({ item, onEdit, onViewDetails }: CropSeasonCardProps) {
    const getStatusColor = (status: CropSeasonStatusValue) => {
        switch (status) {
            case CropSeasonStatusValue.Active:
                return '#10B981';
            case CropSeasonStatusValue.Paused:
                return '#F59E0B';
            case CropSeasonStatusValue.Completed:
                return '#3B82F6';
            case CropSeasonStatusValue.Cancelled:
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusBackgroundColor = (status: CropSeasonStatusValue) => {
        switch (status) {
            case CropSeasonStatusValue.Active:
                return '#D1FAE5';
            case CropSeasonStatusValue.Paused:
                return '#FEF3C7';
            case CropSeasonStatusValue.Completed:
                return '#DBEAFE';
            case CropSeasonStatusValue.Cancelled:
                return '#FEE2E2';
            default:
                return '#F3F4F6';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return 'N/A';
        }
    };

    return (
        <Card style={styles.card} onPress={onViewDetails}>
            <Card.Content style={styles.cardContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.seasonName} numberOfLines={1}>
                            {item.seasonName}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: getStatusBackgroundColor(item.status),
                            borderColor: getStatusColor(item.status)
                        }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: getStatusColor(item.status) }
                        ]}>
                            {CropSeasonStatusLabels[item.status]}
                        </Text>
                    </View>
                </View>

                {/* Info Rows */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="calendar-range" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Thời gian:</Text>
                        <Text style={styles.infoValue}>
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>

                    {item.area && (
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Diện tích:</Text>
                            <Text style={styles.infoValue}>{item.area} ha</Text>
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Nông dân:</Text>
                        <Text style={styles.infoValue}>{item.farmerName}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
                        <MaterialCommunityIcons name="eye" size={20} color="#3B82F6" />
                        <Text style={[styles.actionText, { color: '#3B82F6' }]}>Xem</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
                        <Text style={[styles.actionText, { color: '#F59E0B' }]}>Sửa</Text>
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        backgroundColor: '#FFFFFF',
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    seasonName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    infoContainer: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
        marginRight: 8,
        minWidth: 70,
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
});
