// import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Searchbar } from 'react-native-paper';

import Background from '@/components/Background';
import WarehouseRequestCard from '@/components/WarehouseRequestCard';
import { getWarehouseInboundRequestsForCurrentUser, WarehouseInboundRequestListItem } from '@/core/api/warehouseRequest.api';

export default function WarehouseRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<WarehouseInboundRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang tải danh sách yêu cầu nhập kho...');
      const data = await getWarehouseInboundRequestsForCurrentUser();
      console.log('📦 Dữ liệu nhận được:', data);
      console.log('📦 Số lượng yêu cầu:', data?.length || 0);

      // Filter locally since API doesn't support search/status params
      let filteredData = data || [];

      if (searchQuery && Array.isArray(filteredData)) {
        filteredData = filteredData.filter(request =>
          request.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedStatus && Array.isArray(filteredData)) {
        console.log('🔍 Filtering by status:', selectedStatus);
        filteredData = filteredData.filter(request => {
          const requestStatus = request.status?.toString().toUpperCase();
          const selectedStatusUpper = selectedStatus.toUpperCase();
          console.log('🔍 Request status:', requestStatus, 'vs selected:', selectedStatusUpper);
          return requestStatus === selectedStatusUpper;
        });
      }

      console.log('🔍 Dữ liệu sau khi filter:', filteredData);
      setRequests(filteredData);

      // Tính số lượng cho mỗi trạng thái
      const counts: { [key: string]: number } = {};
      if (data && Array.isArray(data)) {
        data.forEach(request => {
          const status = request.status?.toString().toUpperCase() || 'UNKNOWN';
          counts[status] = (counts[status] || 0) + 1;
        });
      }
      setStatusCounts(counts);
      console.log('📊 Status counts:', counts);
    } catch (error) {
      console.error('❌ Lỗi tải danh sách yêu cầu:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  // Refresh data when screen comes into focus (e.g., after creating a new request)
  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Từ chối' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
  ];

  const handleRequestPress = (requestId: string) => {
    console.log('📋 Navigating to detail:', requestId);
    router.push(`/warehouse/${requestId}`);
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

  return (
    <Background>
      {/* Header with Action Buttons */}
      <View style={styles.headerContainer}>
        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.headerButton}
          textColor="#6B7280"
          icon="arrow-left"
        >
          Quay lại
        </Button>

        <Button
          mode="contained"
          onPress={() => router.push('/warehouse/create')}
          style={styles.createButton}
          buttonColor="#FD7622"
          icon="plus"
        >
          Tạo yêu cầu
        </Button>
      </View>

      <View style={styles.container}>
        <Searchbar
          placeholder="Tìm kiếm yêu cầu..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilter}
          contentContainerStyle={styles.statusFilterContent}
        >
          {statusOptions.map((option) => {
            const count = option.value ? statusCounts[option.value.toUpperCase()] || 0 : Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusChip,
                  selectedStatus === option.value && styles.statusChipActive,
                ]}
                onPress={() => {
                  console.log('🔍 Clicking status filter:', option.value, option.label);
                  setSelectedStatus(option.value);
                }}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedStatus === option.value && styles.statusChipTextActive,
                  ]}
                >
                  {option.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 64, color: "#9CA3AF" }}>📦</Text>
              <Text style={styles.emptyTitle}>Chưa có yêu cầu nhập kho</Text>
              <Text style={styles.emptySubtitle}>
                Tạo yêu cầu nhập kho đầu tiên để bắt đầu
              </Text>
            </View>
          ) : (
            requests.map((request) => {
              console.log('🔍 Request object in map:', request);
              console.log('🔍 Request.id:', request.id);
              console.log('🔍 Request.requestId:', request.requestId);
              console.log('🔍 All request keys:', Object.keys(request));

              // Sử dụng inboundRequestId (UUID) cho API call, không phải requestCode
              const requestId = request.inboundRequestId || request.id || request.requestId || request.warehouseInboundRequestId;
              console.log('🔍 Final requestId to use:', requestId);
              console.log('🔍 RequestCode (for display):', request.requestCode);

              return (
                <WarehouseRequestCard
                  key={requestId}
                  request={request}
                  onPress={() => {
                    console.log('📋 Clicking request with ID:', requestId);
                    if (requestId) {
                      handleRequestPress(requestId);
                    } else {
                      console.error('❌ No valid ID found for request:', request);
                    }
                  }}
                />
              );
            })
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/warehouse/create')}
          color="#FFFFFF"
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchBar: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statusFilter: {
    marginBottom: 8,
  },
  statusFilterContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    maxWidth: 70,
  },
  statusChipActive: {
    backgroundColor: '#FD7622',
    borderColor: '#FD7622',
  },
  statusChipText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    minWidth: 80,
  },
  createButton: {
    borderRadius: 8,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FD7622',
  },
});
