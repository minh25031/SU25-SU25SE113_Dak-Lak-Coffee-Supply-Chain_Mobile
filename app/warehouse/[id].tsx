import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';

import Background from '@/components/Background';
import Header from '@/components/Header';
import { cancelWarehouseInboundRequest, getProcessingBatchesForFarmer, getWarehouseInboundRequestById, WarehouseInboundRequest } from '@/core/api/warehouseRequest.api';
import { getWarehouseInboundRequestStatusColor, getWarehouseInboundRequestStatusLabel } from '@/core/enums/warehouseRequestStatus';

export default function WarehouseRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<WarehouseInboundRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [batchInfo, setBatchInfo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  const loadRequestDetail = async () => {
    try {
      setLoading(true);
      const data = await getWarehouseInboundRequestById(id);
      setRequest(data);

      // Lấy thông tin batch nếu có batchId
      if (data?.batchId) {
        const batches = await getProcessingBatchesForFarmer();

        const batch = batches.find(b => b.batchId === data.batchId);

        setBatchInfo(batch);
      }
    } catch (error) {
      console.error('❌ Lỗi tải chi tiết yêu cầu:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;

    // Sử dụng inboundRequestId thay vì id
    const requestId = request.id;

    if (!requestId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID yêu cầu để hủy');
      return;
    }

    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy yêu cầu nhập kho này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const result = await cancelWarehouseInboundRequest(requestId);
              if (result.code === 200) {
                Alert.alert('Thành công', 'Đã hủy yêu cầu nhập kho');
                loadRequestDetail(); // Reload để cập nhật trạng thái
              } else {
                Alert.alert('Lỗi', result.message);
              }
            } catch (error) {
              console.error('❌ Cancel error:', error);
              Alert.alert('Lỗi', 'Không thể hủy yêu cầu');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  const canCancel = request?.status === 'Pending';
  console.log('🔍 Cancel button debug:', {
    requestStatus: request?.status,
    canCancel,
    requestId: request?.id,
    statusType: typeof request?.status
  });

  if (loading) {
    return (
      <Background>
        <Header title="Chi tiết yêu cầu" showBack={true} text={undefined} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7622" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Background>
    );
  }

  if (!request) {
    return (
      <Background>
        <Header title="Chi tiết yêu cầu" showBack text={undefined} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Không tìm thấy yêu cầu</Text>
          <Text style={styles.errorSubtitle}>
            Yêu cầu nhập kho này có thể đã bị xóa hoặc không tồn tại
          </Text>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <Header title="Chi tiết yêu cầu" showBack text={undefined} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.coffeeInfo}>
                <MaterialCommunityIcons name="package-variant" size={24} color="#FD7622" />
                <View>
                  <Text style={styles.coffeeName}>
                    {request.coffeeType || batchInfo?.typeName || batchInfo?.batchCode || request.batchName || request.batchId || 'Không có tên mẻ'}
                  </Text>
                  {request.requestCode && (
                    <Text style={styles.requestCode}>Mã: {request.requestCode}</Text>
                  )}
                </View>
              </View>
              <Chip
                style={[styles.statusChip, { backgroundColor: getWarehouseInboundRequestStatusColor(request.status) }]}
                textStyle={styles.statusChipText}
              >
                {getWarehouseInboundRequestStatusLabel(request.status)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="scale" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Số lượng:</Text>
              <Text style={styles.infoValue}>{request.requestedQuantity} kg</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Nông dân:</Text>
              <Text style={styles.infoValue}>{request.farmerName || batchInfo?.farmerName || 'N/A'}</Text>
            </View>

            {/* Batch Information - từ API response */}
            {request.batchCode && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="barcode" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Mã lô:</Text>
                <Text style={styles.infoValue}>{request.batchCode}</Text>
              </View>
            )}

            {request.coffeeType && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="coffee" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Loại cà phê:</Text>
                <Text style={styles.infoValue}>{request.coffeeType}</Text>
              </View>
            )}

            {request.seasonCode && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="leaf" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Mùa vụ:</Text>
                <Text style={styles.infoValue}>{request.seasonCode}</Text>
              </View>
            )}

            {/* Batch Information - từ ProcessingBatch nếu có */}
            {batchInfo && (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="scale" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Số lượng đã xử lý:</Text>
                  <Text style={styles.infoValue}>{batchInfo.totalOutputQuantity || batchInfo.totalInputQuantity || 0} kg</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calculator" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Còn lại có thể gửi:</Text>
                  <Text style={styles.infoValue}>{Math.max(0, ((batchInfo.totalOutputQuantity || batchInfo.totalInputQuantity || 0)) - request.requestedQuantity)} kg</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Ghi chú:</Text>
                  <Text style={styles.infoValue}>Số lượng đã xử lý = 0 vì batch chưa có progress</Text>
                </View>
              </>
            )}



            {request.businessStaffName && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-check" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Người duyệt:</Text>
                <Text style={styles.infoValue}>{request.businessStaffName}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Thông tin thời gian</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="truck-delivery" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Ngày giao dự kiến:</Text>
              <Text style={styles.infoValue}>{formatDate(request.preferredDeliveryDate)}</Text>
            </View>

            {request.actualDeliveryDate && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Ngày giao thực tế:</Text>
                <Text style={styles.infoValue}>{formatDate(request.actualDeliveryDate)}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Tạo lúc:</Text>
              <Text style={styles.infoValue}>{formatDate(request.createdAt)}</Text>
            </View>

            {request.updatedAt !== request.createdAt && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="update" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Cập nhật lúc:</Text>
                <Text style={styles.infoValue}>{formatDate(request.updatedAt)}</Text>
              </View>
            )}

            {request.approvedAt && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Duyệt lúc:</Text>
                <Text style={styles.infoValue}>{formatDate(request.approvedAt)}</Text>
              </View>
            )}

            {request.rejectedAt && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Từ chối lúc:</Text>
                <Text style={styles.infoValue}>{formatDate(request.rejectedAt)}</Text>
              </View>
            )}

            {request.cancelledAt && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="cancel" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Hủy lúc:</Text>
                <Text style={styles.infoValue}>{formatDate(request.cancelledAt)}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {request.note && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Ghi chú</Text>
              <Text style={styles.noteText}>{request.note}</Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.backButton}
            textColor="#6B7280"
            buttonColor="transparent"
            icon="arrow-left"
          >
            Quay lại
          </Button>

          {canCancel && (
            <Button
              mode="outlined"
              onPress={handleCancelRequest}
              loading={cancelling}
              disabled={cancelling}
              style={styles.cancelButton}
              textColor="#EF4444"
              buttonColor="transparent"
              icon="close-circle"
            >
              Hủy yêu cầu
            </Button>
          )}


        </View>

        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Debug: Status = &quot;{request.status}&quot; | CanCancel = {canCancel.toString()}</Text>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coffeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  requestCode: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    borderColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#EF4444',
  },
  debugInfo: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
});
