import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button, Card, TextInput, Divider, HelperText } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import {
  getShipmentById,
  updateShipmentStatus,
  confirmDelivery
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
  const [errors, setErrors] = useState<{
    note?: string;
    status?: string;
    general?: string;
  }>({});

  // Validation functions
  const validateNote = (text: string): string | undefined => {
    if (text.length > 1000) {
      return 'Ghi chú không được vượt quá 1000 ký tự';
    }
    return undefined;
  };

  const validateStatusTransition = (currentStatus: string, newStatus: string): string | undefined => {
    if (!canTransitionToStatus(currentStatus, newStatus)) {
      return `Không thể chuyển từ trạng thái "${getStatusText(currentStatus)}" sang "${getStatusText(newStatus)}"`;
    }
    return undefined;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const loadShipment = useCallback(async () => {
    if (!shipmentId) return;

    try {
      setLoading(true);
      clearErrors();
      const shipment = await getShipmentById(shipmentId);
      setCurrentShipment(shipment);
    } catch (error) {
      console.error('❌ Error loading shipment:', error);
      setErrors({
        general: 'Không thể tải thông tin chuyến giao. Vui lòng thử lại sau.'
      });
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

    // Clear previous errors
    clearErrors();

    // Validation
    const noteError = validateNote(note);
    const statusError = validateStatusTransition(currentShipment.deliveryStatus, newStatus);

    if (noteError || statusError) {
      setErrors({
        note: noteError,
        status: statusError
      });
      return;
    }

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
      clearErrors();
    } catch (error: any) {
      console.error('❌ Error updating status:', error);

      // Handle specific errors
      let errorMessage = 'Không thể cập nhật trạng thái. Vui lòng thử lại sau.';

      if (error.response?.status === 409) {
        errorMessage = 'Không thể cập nhật trạng thái. Có thể dữ liệu đã bị thay đổi bởi người khác. Vui lòng làm mới trang và thử lại.';
      } else if (error.response?.status === 400) {
        if (error.response?.data?.errors) {
          // Handle validation errors from backend
          const backendErrors = error.response.data.errors;
          const newErrors: any = {};

          if (backendErrors.DeliveryStatus) {
            newErrors.status = backendErrors.DeliveryStatus[0];
          }
          if (backendErrors.Note) {
            newErrors.note = backendErrors.Note[0];
          }
          if (backendErrors.ReceivedAt) {
            newErrors.status = backendErrors.ReceivedAt[0];
          }

          setErrors(newErrors);
          return;
        } else {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện hành động này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy chuyến giao hàng.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }

      setErrors({ general: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!currentShipment) return;

    // Clear previous errors
    clearErrors();

    // Validation
    const noteError = validateNote(note);
    if (noteError) {
      setErrors({ note: noteError });
      return;
    }

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
              clearErrors();
            } catch (error: any) {
              console.error('❌ Error confirming delivery:', error);

              // Handle specific errors
              let errorMessage = 'Không thể xác nhận giao hàng. Vui lòng thử lại sau.';

              if (error.response?.status === 409) {
                errorMessage = 'Không thể xác nhận giao hàng. Có thể dữ liệu đã bị thay đổi bởi người khác. Vui lòng làm mới trang và thử lại.';
              } else if (error.response?.status === 400) {
                if (error.response?.data?.errors) {
                  // Handle validation errors from backend
                  const backendErrors = error.response.data.errors;
                  const newErrors: any = {};

                  if (backendErrors.DeliveryStatus) {
                    newErrors.status = backendErrors.DeliveryStatus[0];
                  }
                  if (backendErrors.Note) {
                    newErrors.note = backendErrors.Note[0];
                  }
                  if (backendErrors.ReceivedAt) {
                    newErrors.status = backendErrors.ReceivedAt[0];
                  }

                  setErrors(newErrors);
                  return;
                } else {
                  errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                }
              } else if (error.response?.status === 401) {
                errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
              } else if (error.response?.status === 403) {
                errorMessage = 'Bạn không có quyền thực hiện hành động này.';
              } else if (error.response?.status === 404) {
                errorMessage = 'Không tìm thấy chuyến giao hàng.';
              } else if (error.response?.status === 500) {
                errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
              }

              setErrors({ general: errorMessage });
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

  // Validation: Kiểm tra xem có thể chuyển sang trạng thái mới không
  const canTransitionToStatus = (currentStatus: string, newStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'Pending': ['InTransit', 'Canceled'],
      'InTransit': ['Delivered', 'Failed'],
      'Failed': ['Returned', 'InTransit'], // Có thể thử giao lại
      'Returned': ['InTransit'], // Có thể giao lại sau khi hoàn trả
      'Delivered': [], // Không thể thay đổi sau khi đã giao
      'Canceled': [] // Không thể thay đổi sau khi đã hủy
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
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

  return (
    <Background>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton goBack={() => router.back()} />
          <Text style={styles.headerTitle}>Chi tiết chuyến giao</Text>
          <TouchableOpacity
            onPress={loadShipment}
            style={styles.refreshButton}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={24}
              color={loading ? '#9CA3AF' : '#3B82F6'}
            />
          </TouchableOpacity>
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

                {/* Error Summary */}
                {(errors.note || errors.status || errors.general) && (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.errorTitle}>Vui lòng sửa các lỗi sau:</Text>

                    {errors.note && (
                      <Text style={styles.errorItem}>• {errors.note}</Text>
                    )}
                    {errors.status && (
                      <Text style={styles.errorItem}>• {errors.status}</Text>
                    )}
                    {errors.general && (
                      <Text style={styles.errorItem}>• {errors.general}</Text>
                    )}
                  </View>
                )}

                <TextInput
                  label="Ghi chú (tùy chọn)"
                  value={note}
                  onChangeText={(text) => {
                    setNote(text);
                    if (errors.note) {
                      setErrors(prev => ({ ...prev, note: undefined }));
                    }
                  }}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.noteInput}
                  error={!!errors.note}
                  maxLength={1000}
                />

                {/* Note validation error */}
                {errors.note && (
                  <HelperText type="error" visible={true}>
                    {errors.note}
                  </HelperText>
                )}

                {/* Note character count */}
                <HelperText type="info" visible={true}>
                  {note.length}/1000 ký tự
                </HelperText>

                {/* Status validation error */}
                {errors.status && (
                  <HelperText type="error" visible={true}>
                    {errors.status}
                  </HelperText>
                )}

                {/* General error */}
                {errors.general && (
                  <HelperText type="error" visible={true}>
                    {errors.general}
                  </HelperText>
                )}

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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 28,
    marginBottom: 4,
  },
});
