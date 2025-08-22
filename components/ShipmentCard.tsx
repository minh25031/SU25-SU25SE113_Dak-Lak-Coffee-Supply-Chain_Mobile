import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Shipment } from '@/core/api/delivery.api';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: (shipment: Shipment) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return '#F59E0B'; // Amber
    case 'InTransit':
      return '#3B82F6'; // Blue
    case 'Delivered':
      return '#10B981'; // Green
    case 'Failed':
      return '#EF4444'; // Red
    case 'Returned':
      return '#8B5CF6'; // Purple
    case 'Canceled':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'clock-outline';
    case 'InTransit':
      return 'truck-delivery-outline';
    case 'Delivered':
      return 'check-circle-outline';
    case 'Failed':
      return 'close-circle-outline';
    case 'Returned':
      return 'undo-variant';
    case 'Canceled':
      return 'cancel';
    default:
      return 'help-circle-outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'Chờ giao';
    case 'InTransit':
      return 'Đang giao';
    case 'Delivered':
      return 'Đã giao';
    case 'Failed':
      return 'Giao thất bại';
    case 'Returned':
      return 'Đã hoàn trả';
    case 'Canceled':
      return 'Đã hủy';
    default:
      return status;
  }
};

export default function ShipmentCard({ shipment, onPress }: ShipmentCardProps) {
  // Null check để tránh crash
  if (!shipment) {
    return null;
  }

  const statusColor = getStatusColor(shipment.deliveryStatus);
  const statusIcon = getStatusIcon(shipment.deliveryStatus);
  const statusText = getStatusText(shipment.deliveryStatus);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(shipment)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.shipmentInfo}>
          <Text style={styles.shipmentCode}>{shipment.shipmentCode}</Text>
          <Text style={styles.orderCode}>Đơn hàng: {shipment.orderCode}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons
            name={statusIcon as any}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="package-variant" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {shipment.shippedQuantity}kg
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Giao: {formatDate(shipment.shippedAt)}
          </Text>
        </View>

        {shipment.receivedAt && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: '#10B981' }]}>
              Hoàn thành: {formatDate(shipment.receivedAt)}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {shipment.shipmentDetails?.length || 0} sản phẩm
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.createdAt}>
          Tạo: {formatDate(shipment.createdAt)}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shipmentInfo: {
    flex: 1,
  },
  shipmentCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  createdAt: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
