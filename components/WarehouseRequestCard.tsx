import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { WarehouseInboundRequestListItem } from '@/core/api/warehouseRequest.api';
import { getWarehouseInboundRequestStatusColor, getWarehouseInboundRequestStatusLabel } from '@/core/enums/warehouseRequestStatus';

interface Props {
  request: WarehouseInboundRequestListItem;
  onPress: () => void;
}

export default function WarehouseRequestCard({ request, onPress }: Props) {

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.coffeeInfo}>
          <MaterialCommunityIcons name="package-variant" size={20} color="#FD7622" />
          <Text style={styles.coffeeName}>
            {request.batchName || request.batchCode || request.batchId || request.requestCode || `Yêu cầu #${(request.inboundRequestId || request.id || request.requestId || '').slice(0, 8)}`}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getWarehouseInboundRequestStatusColor(request.status || 'PENDING') }]}>
          <Text style={styles.statusText}>
            {getWarehouseInboundRequestStatusLabel(request.status || 'PENDING')}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="scale" size={16} color="#6B7280" />
          <Text style={styles.label}>Số lượng:</Text>
          <Text style={styles.value}>{request.requestedQuantity} kg</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.label}>Ngày giao:</Text>
          <Text style={styles.value}>{formatDate(request.preferredDeliveryDate)}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>Tạo lúc:</Text>
          <Text style={styles.value}>{formatDate(request.createdAt)}</Text>
        </View>

        {request.businessStaffName && (
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-check" size={16} color="#6B7280" />
            <Text style={styles.label}>Người duyệt:</Text>
            <Text style={styles.value}>{request.businessStaffName}</Text>
          </View>
        )}
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coffeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 8,
    minWidth: 80,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
});
