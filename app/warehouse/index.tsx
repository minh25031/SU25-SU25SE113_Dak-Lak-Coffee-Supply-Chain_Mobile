import BackButton from "@/components/BackButton";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ActivityIndicator, Button, FAB, Searchbar } from 'react-native-paper';
import DropDownPicker from "react-native-dropdown-picker";

import Background from '@/components/Background';
import WarehouseRequestCard from '@/components/WarehouseRequestCard';
import { getWarehouseInboundRequestsForCurrentUser, WarehouseInboundRequestListItem } from '@/core/api/warehouseRequest.api';

export default function WarehouseRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<WarehouseInboundRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusItems, setStatusItems] = useState([
    { label: "Tất cả", value: "all" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã duyệt", value: "APPROVED" },
    { label: "Từ chối", value: "REJECTED" },
    { label: "Đã hủy", value: "CANCELLED" },
    { label: "Hoàn thành", value: "COMPLETED" },
  ]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const data = await getWarehouseInboundRequestsForCurrentUser();

      const loadTime = Date.now() - startTime;

      // Filter locally since API doesn't support search/status params
      let filteredData = data || [];

      if (searchQuery && Array.isArray(filteredData)) {
        filteredData = filteredData.filter(request =>
          request.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedStatus && selectedStatus !== "all" && Array.isArray(filteredData)) {
        filteredData = filteredData.filter(request => {
          const requestStatus = request.status?.toString().toUpperCase();
          const selectedStatusUpper = selectedStatus.toUpperCase();
          return requestStatus === selectedStatusUpper;
        });
      }

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

  const handleRequestPress = (requestId: string) => {
    router.push(`/warehouse/${requestId}`);
  };

  const renderItem = ({ item }: { item: WarehouseInboundRequestListItem }) => {
    const requestId = item.inboundRequestId || item.id || item.requestId || item.warehouseInboundRequestId;
    return (
      <WarehouseRequestCard
        key={requestId}
        request={item}
        onPress={() => {
          if (requestId) {
            handleRequestPress(requestId);
          } else {
            console.error('❌ No valid ID found for request:', item);
          }
        }}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD7622" />
        <Text style={styles.loadingText}>Đang tải danh sách yêu cầu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton goBack={() => router.back()} />
        <Text style={styles.headerTitle}>Kho hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm yêu cầu..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
        <DropDownPicker
          open={statusOpen}
          value={selectedStatus}
          items={statusItems}
          setOpen={setStatusOpen}
          setValue={setSelectedStatus}
          setItems={setStatusItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          placeholder="Chọn trạng thái"
          zIndex={3000}
          zIndexInverse={1000}
        />
      </View>

      {/* Content */}
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có yêu cầu nhập kho nào</Text>
          <Text style={styles.emptySubText}>
            {selectedStatus === "all"
              ? "Bạn chưa có yêu cầu nhập kho nào. Hãy tạo yêu cầu đầu tiên!"
              : `Không có yêu cầu nào với trạng thái "${selectedStatus !== "all" && statusItems.find(item => item.value === selectedStatus)?.label || "không xác định"}"`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => (item.inboundRequestId || item.id || item.requestId || item.warehouseInboundRequestId)?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FD7622"]}
              tintColor="#FD7622"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB for Create */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/warehouse/create')}
        label="Tạo yêu cầu"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FD7622',
  },
});
