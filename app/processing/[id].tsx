import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button, Divider, ActivityIndicator } from 'react-native-paper';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { processingAPI, ProcessingBatchDetail } from '@/core/api/processing.api';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'processing':
      return '#F59E0B';
    case 'pending':
      return '#6B7280';
    case 'failed':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'processing':
      return 'Đang xử lý';
    case 'pending':
      return 'Chờ xử lý';
    case 'failed':
      return 'Thất bại';
    default:
      return 'Không xác định';
  }
};

export default function ProcessingBatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [batchDetail, setBatchDetail] = useState<ProcessingBatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await processingAPI.getBatchById(id as string);
      setBatchDetail(data);
    } catch (err) {
      console.error('Error fetching batch detail:', err);
      setError('Không thể tải thông tin lô sơ chế');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBatchDetail();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBatchDetail();
  }, [id, fetchBatchDetail]);

  const handleUpdateProgress = () => {
    Alert.alert('Thông báo', 'Tính năng cập nhật tiến độ sẽ được phát triển sau');
  };

  const handleViewStages = () => {
    Alert.alert('Thông báo', 'Tính năng xem giai đoạn sẽ được phát triển sau');
  };

  const handleEditBatch = () => {
    Alert.alert('Thông báo', 'Tính năng chỉnh sửa sẽ được phát triển sau');
  };

  const handleDeleteBatch = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa lô sơ chế này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await processingAPI.deleteBatch(id as string);
              router.back();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa lô sơ chế');
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <Background>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7622" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Background>
    );
  }

  if (error || !batchDetail) {
    return (
      <Background>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Chi tiết lô sơ chế</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin lô sơ chế'}</Text>
            <TouchableOpacity onPress={fetchBatchDetail} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Chi tiết lô sơ chế</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Batch Info Card */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.batchHeader}>
                <Text style={styles.batchCode}>{batchDetail.batchCode}</Text>
                <Badge
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(batchDetail.status) }]}
                >
                  {getStatusText(batchDetail.status)}
                </Badge>
              </View>

              {batchDetail.description && (
                <Text style={styles.description}>{batchDetail.description}</Text>
              )}

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="coffee" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Loại cà phê</Text>
                  <Text style={styles.infoValue}>{batchDetail.typeName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Mùa vụ</Text>
                  <Text style={styles.infoValue}>{batchDetail.cropSeasonName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="scale-balance" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Đầu vào</Text>
                  <Text style={styles.infoValue}>{batchDetail.totalInputQuantity} kg</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Đầu ra</Text>
                  <Text style={styles.infoValue}>{batchDetail.totalOutputQuantity} kg</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Tiến độ xử lý</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${batchDetail.progress}%`,
                          backgroundColor: getStatusColor(batchDetail.status)
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{batchDetail.progress}%</Text>
                </View>
                <Text style={styles.currentStage}>Giai đoạn hiện tại: {batchDetail.currentStage}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Processing Stages */}
          {batchDetail.stages && batchDetail.stages.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Các giai đoạn xử lý</Text>
                  <TouchableOpacity onPress={handleViewStages}>
                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                {batchDetail.stages.slice(0, 3).map((stage) => (
                  <View key={stage.id} style={styles.stageItem}>
                    <View style={styles.stageInfo}>
                      <View style={styles.stageHeader}>
                        <Text style={styles.stageName}>{stage.name}</Text>
                        <Badge
                          style={[styles.stageBadge, { backgroundColor: getStatusColor(stage.status) }]}
                        >
                          {getStatusText(stage.status)}
                        </Badge>
                      </View>
                      {stage.outputQuantity && (
                        <Text style={styles.stageOutput}>Sản lượng: {stage.outputQuantity} kg</Text>
                      )}
                      {stage.notes && (
                        <Text style={styles.stageNotes}>{stage.notes}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Processing Parameters */}
          {batchDetail.parameters && batchDetail.parameters.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Thông số xử lý</Text>
                <View style={styles.parametersGrid}>
                  {batchDetail.parameters.map((param, index) => (
                    <View key={index} style={styles.parameterItem}>
                      <Text style={styles.parameterName}>{param.name}</Text>
                      <Text style={styles.parameterValue}>
                        {param.value}{param.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleUpdateProgress}
              style={[styles.actionButton, styles.primaryButton]}
              labelStyle={styles.buttonLabel}
            >
              Cập nhật tiến độ
            </Button>

            <View style={styles.secondaryButtons}>
              <Button
                mode="outlined"
                onPress={handleEditBatch}
                style={[styles.actionButton, styles.secondaryButton]}
                labelStyle={styles.buttonLabel}
              >
                Chỉnh sửa
              </Button>

              <Button
                mode="outlined"
                onPress={handleDeleteBatch}
                style={[styles.actionButton, styles.dangerButton]}
                labelStyle={[styles.buttonLabel, styles.dangerButtonLabel]}
              >
                Xóa
              </Button>
            </View>
          </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FD7622',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
  },
  currentStage: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FD7622',
    fontWeight: '500',
  },
  stageItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stageInfo: {
    flex: 1,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  stageBadge: {
    alignSelf: 'flex-start',
  },
  stageOutput: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  stageNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  parameterItem: {
    width: '50%',
    marginBottom: 12,
  },
  parameterName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtons: {
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#FD7622',
  },
  secondaryButton: {
    borderColor: '#6B7280',
  },
  dangerButton: {
    borderColor: '#EF4444',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButtonLabel: {
    color: '#EF4444',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
