import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, FAB, Searchbar, ActivityIndicator, Button, Chip } from 'react-native-paper';

import Background from '@/components/Background';
import BackButton from '@/components/BackButton';
import { processingAPI, ProcessingBatch } from '@/core/api/processing.api';

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'check-circle';
    case 'processing':
      return 'progress-clock';
    case 'pending':
      return 'clock-outline';
    case 'failed':
      return 'alert-circle';
    default:
      return 'help-circle';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function ProcessingBatchesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await processingAPI.getAllBatches();
      setBatches(data);
      setFilteredBatches(data);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Không thể tải danh sách lô sơ chế. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBatches();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    let filtered = batches;

    // Áp dụng filter theo trạng thái
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === selectedFilter);
    }

    // Áp dụng search
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(batch =>
        batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.cropSeasonName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBatches(filtered);
  }, [searchQuery, batches, selectedFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateBatch = () => {
    Alert.alert(
      'Tạo lô sơ chế mới',
      'Bạn muốn tạo lô sơ chế mới cho vụ mùa này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo mới',
          onPress: () => {
            // TODO: Navigate to create page when available
            Alert.alert(
              'Thông báo',
              'Tính năng tạo lô sơ chế sẽ được phát triển trong phiên bản tiếp theo. Vui lòng liên hệ nhân viên hỗ trợ.',
              [{ text: 'Đã hiểu', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleViewDetail = (batchId: string) => {
    router.push(`/processing/${batchId}` as any);
  };

  const handleDeleteBatch = (batchId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa lô sơ chế này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await processingAPI.deleteBatch(batchId);
              fetchBatches();
              Alert.alert('Thành công', 'Đã xóa lô sơ chế thành công');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa lô sơ chế. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };

  const handleUpdateProgress = (batchId: string) => {
    Alert.alert(
      'Cập nhật tiến độ',
      'Bạn muốn cập nhật tiến độ xử lý cho lô này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Cập nhật',
          onPress: () => {
            Alert.alert(
              'Thông báo',
              'Tính năng cập nhật tiến độ sẽ được phát triển trong phiên bản tiếp theo.',
              [{ text: 'Đã hiểu', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const getFilterCount = (status: string) => {
    if (status === 'all') return batches.length;
    return batches.filter(b => b.status === status).length;
  };

  if (loading && !refreshing) {
    return (
      <Background>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7622" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng chờ trong giây lát</Text>
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Lô sơ chế của tôi</Text>
            <Text style={styles.subtitle}>Quản lý quy trình sơ chế cà phê</Text>
          </View>
          <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Trợ giúp', 'Liên hệ nhân viên hỗ trợ: 1900-xxxx')}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#FD7622" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {!error && batches.length > 0 && (
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="coffee" size={20} color="#FD7622" />
              </View>
              <Text style={styles.statNumber}>{batches.length}</Text>
              <Text style={styles.statLabel}>Tổng lô</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="progress-clock" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>
                {batches.filter(b => b.status === 'processing').length}
              </Text>
              <Text style={styles.statLabel}>Đang xử lý</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>
                {batches.filter(b => b.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>
                {batches.filter(b => b.status === 'failed').length}
              </Text>
              <Text style={styles.statLabel}>Cần hỗ trợ</Text>
            </View>
          </View>
        )}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={[styles.filterChip, selectedFilter === 'all' && styles.selectedFilterChip]}
            textStyle={[styles.filterText, selectedFilter === 'all' && styles.selectedFilterText]}
          >
            Tất cả ({getFilterCount('all')})
          </Chip>
          <Chip
            selected={selectedFilter === 'processing'}
            onPress={() => setSelectedFilter('processing')}
            style={[styles.filterChip, selectedFilter === 'processing' && styles.selectedFilterChip]}
            textStyle={[styles.filterText, selectedFilter === 'processing' && styles.selectedFilterText]}
          >
            Đang xử lý ({getFilterCount('processing')})
          </Chip>
          <Chip
            selected={selectedFilter === 'completed'}
            onPress={() => setSelectedFilter('completed')}
            style={[styles.filterChip, selectedFilter === 'completed' && styles.selectedFilterChip]}
            textStyle={[styles.filterText, selectedFilter === 'completed' && styles.selectedFilterText]}
          >
            Hoàn thành ({getFilterCount('completed')})
          </Chip>
          <Chip
            selected={selectedFilter === 'pending'}
            onPress={() => setSelectedFilter('pending')}
            style={[styles.filterChip, selectedFilter === 'pending' && styles.selectedFilterChip]}
            textStyle={[styles.filterText, selectedFilter === 'pending' && styles.selectedFilterText]}
          >
            Chờ xử lý ({getFilterCount('pending')})
          </Chip>
        </ScrollView>

        {/* Search Bar */}
        <Searchbar
          placeholder="Tìm kiếm theo mã lô, loại cà phê..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#FD7622"
          inputStyle={styles.searchInput}
        />

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="wifi-off" size={32} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={fetchBatches}
              style={styles.retryButton}
              buttonColor="#DC2626"
              icon="refresh"
            >
              Thử lại
            </Button>
          </View>
        )}

        {/* Batches List */}
        <ScrollView
          style={styles.batchesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FD7622']} />
          }
        >
          {filteredBatches.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="coffee-off" size={80} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedFilter !== 'all' ? 'Không tìm thấy lô sơ chế' : 'Chưa có lô sơ chế nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Bắt đầu tạo lô sơ chế đầu tiên của bạn để theo dõi quy trình xử lý cà phê'
                }
              </Text>
              {!searchQuery && selectedFilter === 'all' && (
                <Button
                  mode="contained"
                  onPress={handleCreateBatch}
                  style={styles.createButton}
                  buttonColor="#FD7622"
                  icon="plus"
                  contentStyle={styles.createButtonContent}
                >
                  Tạo lô sơ chế đầu tiên
                </Button>
              )}
            </View>
          ) : (
            filteredBatches.map((batch) => (
              <Card key={batch.id} style={styles.batchCard}>
                <Card.Content>
                  {/* Header với mã lô và trạng thái */}
                  <View style={styles.batchHeader}>
                    <View style={styles.batchInfo}>
                      <View style={styles.batchCodeContainer}>
                        <MaterialCommunityIcons name="barcode" size={16} color="#6B7280" />
                        <Text style={styles.batchCode}>{batch.batchCode}</Text>
                      </View>
                      <View style={styles.statusContainer}>
                        <MaterialCommunityIcons
                          name={getStatusIcon(batch.status) as any}
                          size={16}
                          color={getStatusColor(batch.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(batch.status) }]}>
                          {getStatusText(batch.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.batchActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => handleViewDetail(batch.id)}
                      >
                        <MaterialCommunityIcons name="eye" size={18} color="#3B82F6" />
                        <Text style={styles.actionText}>Xem</Text>
                      </TouchableOpacity>
                      {batch.status === 'processing' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.updateButton]}
                          onPress={() => handleUpdateProgress(batch.id)}
                        >
                          <MaterialCommunityIcons name="pencil" size={18} color="#F59E0B" />
                          <Text style={styles.actionText}>Cập nhật</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Thông tin chi tiết */}
                  <View style={styles.batchDetails}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="coffee" size={18} color="#6B7280" />
                      <Text style={styles.detailLabel}>Loại cà phê:</Text>
                      <Text style={styles.detailValue}>{batch.typeName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
                      <Text style={styles.detailLabel}>Mùa vụ:</Text>
                      <Text style={styles.detailValue}>{batch.cropSeasonName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="scale-balance" size={18} color="#6B7280" />
                      <Text style={styles.detailLabel}>Sản lượng:</Text>
                      <Text style={styles.detailValue}>
                        {batch.totalInputQuantity}kg → {batch.totalOutputQuantity}kg
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="progress-clock" size={18} color="#6B7280" />
                      <Text style={styles.detailLabel}>Giai đoạn:</Text>
                      <Text style={styles.detailValue}>{batch.currentStage}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar-clock" size={18} color="#6B7280" />
                      <Text style={styles.detailLabel}>Ngày tạo:</Text>
                      <Text style={styles.detailValue}>{formatDate(batch.createdAt)}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Tiến độ xử lý</Text>
                      <Text style={styles.progressPercent}>{batch.progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${batch.progress}%`,
                            backgroundColor: getStatusColor(batch.status)
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {batch.progress === 100 ? 'Đã hoàn thành xử lý' : `Đang xử lý giai đoạn ${batch.currentStage}`}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    <Button
                      mode="contained"
                      onPress={() => handleViewDetail(batch.id)}
                      style={styles.cardButton}
                      buttonColor="#3B82F6"
                      icon="eye"
                      contentStyle={styles.cardButtonContent}
                    >
                      Chi tiết
                    </Button>
                    {batch.status === 'processing' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateProgress(batch.id)}
                        style={styles.cardButton}
                        icon="pencil"
                        contentStyle={styles.cardButtonContent}
                      >
                        Cập nhật
                      </Button>
                    )}
                    {batch.status === 'pending' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleDeleteBatch(batch.id)}
                        style={[styles.cardButton, styles.deleteButton]}
                        icon="delete"
                        textColor="#EF4444"
                        contentStyle={styles.cardButtonContent}
                      >
                        Xóa
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>

        {/* FAB for creating new batch */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateBatch}
          color="white"
          label="Tạo lô mới"
        />
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
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  helpButton: {
    padding: 8,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  selectedFilterChip: {
    backgroundColor: '#FD7622',
    borderColor: '#FD7622',
  },
  filterText: {
    color: '#6B7280',
    fontSize: 12,
  },
  selectedFilterText: {
    color: 'white',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 8,
  },
  batchesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  createButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  batchCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 16,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  batchInfo: {
    flex: 1,
  },
  batchCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  batchCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  batchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  viewButton: {
    backgroundColor: '#EBF8FF',
  },
  updateButton: {
    backgroundColor: '#FFFBEB',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  batchDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FD7622',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardButton: {
    flex: 1,
    borderRadius: 8,
  },
  cardButtonContent: {
    paddingVertical: 4,
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FD7622',
    borderRadius: 16,
  },
});
