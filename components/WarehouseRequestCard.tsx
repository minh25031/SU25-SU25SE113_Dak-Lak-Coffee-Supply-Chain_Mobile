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
          <MaterialCommunityIcons name="package-variant" size={18} color="#FD7622" />
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
          <MaterialCommunityIcons name="scale" size={14} color="#6B7280" />
          <Text style={styles.label}>Số lượng:</Text>
          <Text style={styles.value}>{request.requestedQuantity} kg</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
          <Text style={styles.label}>Ngày giao:</Text>
          <Text style={styles.value}>{formatDate(request.preferredDeliveryDate)}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
          <Text style={styles.label}>Tạo lúc:</Text>
          <Text style={styles.value}>{formatDate(request.createdAt)}</Text>
        </View>

        {request.businessStaffName && (
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-check" size={14} color="#6B7280" />
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coffeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coffeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 6,
    minWidth: 70,
  },
  value: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
});
