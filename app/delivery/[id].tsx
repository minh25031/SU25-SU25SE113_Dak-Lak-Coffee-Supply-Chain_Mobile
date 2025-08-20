import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider, TextInput } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { 
  getShipmentById, 
  updateShipmentStatus, 
  confirmDelivery,
  Shipment 
} from '@/core/api/delivery.api';
import { useDeliveryStore } from '@/stores/deliveryStore';

export default function ShipmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const shipmentId = id as string;

  const { currentShipment, setCurrentShipment, updateShipmentInList } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  const loadShipment = useCallback(async () => {
    if (!shipmentId) return;
    
    try {
      setLoading(true);
      const shipment = await getShipmentById(shipmentId);
      setCurrentShipment(shipment);
    } catch (error) {
      console.error('❌ Error loading shipment:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chuyến giao');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, setCurrentShipment]);

  useFocusEffect(
    useCallback(() => {
      loadShipment();
    }, [loadShipment])
  );

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentShipment) return;

    try {
      setUpdating(true);
      await updateShipmentStatus(shipmentId, {
        deliveryStatus: newStatus,
        note: note.trim() || undefined,
      });

      // Update local state
      const updatedShipment = { ...currentShipment, deliveryStatus: newStatus };
      setCurrentShipment(updatedShipment);
      updateShipmentInList(shipmentId, { deliveryStatus: newStatus });

      Alert.alert('Thành công', 'Đã cập nhật trạng thái giao hàng');
      setNote('');
    } catch (error) {
      console.error('❌ Error updating status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!currentShipment) return;

    Alert.alert(
      'Xác nhận giao hàng',
      'Bạn có chắc chắn muốn xác nhận giao hàng thành công?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setUpdating(true);
              await confirmDelivery(shipmentId, {
                receivedAt: new Date().toISOString(),
                note: note.trim() || undefined,
              });

              // Update local state
              const updatedShipment = { 
                ...currentShipment, 
                deliveryStatus: 'Delivered',
                receivedAt: new Date().toISOString()
              };
              setCurrentShipment(updatedShipment);
              updateShipmentInList(shipmentId, { 
                deliveryStatus: 'Delivered',
                receivedAt: new Date().toISOString()
              });

              Alert.alert('Thành công', 'Đã xác nhận giao hàng thành công');
              setNote('');
            } catch (error) {
              console.error('❌ Error confirming delivery:', error);
              Alert.alert('Lỗi', 'Không thể xác nhận giao hàng');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'InTransit': return '#3B82F6';
      case 'Delivered': return '#10B981';
      case 'Failed': return '#EF4444';
      case 'Returned': return '#8B5CF6';
      case 'Canceled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ giao';
      case 'InTransit': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      case 'Failed': return 'Giao thất bại';
      case 'Returned': return 'Đã hoàn trả';
      case 'Canceled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Background>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </Background>
    );
  }

  if (!currentShipment) {
    return (
      <Background>
        <View style={styles.errorContainer}>
          <Text>Không tìm thấy thông tin chuyến giao</Text>
          <Text style={{ marginTop: 8, color: '#6B7280' }}>
            Vui lòng thử lại sau
          </Text>
        </View>
      </Background>
    );
  }

  const canUpdateStatus = currentShipment.deliveryStatus !== 'Delivered';
  const canConfirmDelivery = currentShipment.deliveryStatus === 'InTransit';

  return (
    <Background>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton goBack={() => router.back()} />
          <Text style={styles.headerTitle}>Chi tiết chuyến giao</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Shipment Info Card */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.shipmentHeader}>
                <Text style={styles.shipmentCode}>{currentShipment.shipmentCode}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(currentShipment.deliveryStatus) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: getStatusColor(currentShipment.deliveryStatus) }
                  ]}>
                    {getStatusText(currentShipment.deliveryStatus)}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Đơn hàng</Text>
                  <Text style={styles.infoValue}>{currentShipment.orderCode}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="scale" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Khối lượng</Text>
                  <Text style={styles.infoValue}>{currentShipment.shippedQuantity}kg</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày giao</Text>
                  <Text style={styles.infoValue}>{formatDate(currentShipment.shippedAt)}</Text>
                </View>
              </View>

              {currentShipment.receivedAt && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Hoàn thành</Text>
                    <Text style={styles.infoValue}>{formatDate(currentShipment.receivedAt)}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nhân viên giao</Text>
                  <Text style={styles.infoValue}>{currentShipment.deliveryStaffName}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Shipment Details */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Chi tiết sản phẩm</Text>
              <Divider style={styles.divider} />

              {currentShipment.shipmentDetails?.map((detail, index) => (
                <View key={detail.shipmentDetailId} style={styles.detailRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailName}>{detail.productName}</Text>
                    <Text style={styles.detailQuantity}>
                      {detail.quantity} {detail.unit}
                    </Text>
                  </View>
                  {detail.note && (
                    <Text style={styles.detailNote}>{detail.note}</Text>
                  )}
                </View>
              )) || (
                <Text style={styles.detailNote}>Không có chi tiết sản phẩm</Text>
              )}
            </Card.Content>
          </Card>

          {/* Action Section */}
          {canUpdateStatus && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Cập nhật trạng thái</Text>
                <Divider style={styles.divider} />

                <TextInput
                  label="Ghi chú (tùy chọn)"
                  value={note}
                  onChangeText={setNote}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.noteInput}
                />

                <View style={styles.actionButtons}>
                  {currentShipment.deliveryStatus === 'Pending' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateStatus('InTransit')}
                      loading={updating}
                      disabled={updating}
                      style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                    >
                      Bắt đầu giao
                    </Button>
                  )}

                  {currentShipment.deliveryStatus === 'InTransit' && (
                    <>
                      <Button
                        mode="contained"
                        onPress={handleConfirmDelivery}
                        loading={updating}
                        disabled={updating}
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                      >
                        Xác nhận giao thành công
                      </Button>

                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateStatus('Failed')}
                        loading={updating}
                        disabled={updating}
                        style={[styles.actionButton, { borderColor: '#EF4444' }]}
                        labelStyle={{ color: '#EF4444' }}
                      >
                        Giao thất bại
                      </Button>
                    </>
                  )}

                  {currentShipment.deliveryStatus === 'Failed' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateStatus('Returned')}
                      loading={updating}
                      disabled={updating}
                      style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                    >
                      Hoàn trả hàng
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  detailQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noteInput: {
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
