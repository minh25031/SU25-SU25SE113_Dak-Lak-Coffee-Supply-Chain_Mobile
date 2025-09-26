import BackButton from "@/components/BackButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { useWarehouseRequest } from "@/core/hooks/useWarehouseRequest";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState, useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View, FlatList } from 'react-native';
import { FAB as Fab, Searchbar } from 'react-native-paper';
import DropDownPicker from "react-native-dropdown-picker";

import WarehouseRequestCard from '@/components/WarehouseRequestCard';
import { WarehouseInboundRequestListItem } from '@/core/api/warehouseRequest.api';

export default function WarehouseRequestsScreen() {
  const router = useRouter();
  const { requests: allRequests, loading, refreshing, error, onRefresh } = useWarehouseRequest();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all");

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusItems, setStatusItems] = useState([
    { label: "Tất cả", value: "all" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã duyệt", value: "APPROVED" },
    { label: "Từ chối", value: "REJECTED" },
    { label: "Đã hủy", value: "CANCELLED" },
    { label: "Hoàn thành", value: "COMPLETED" },
  ]);

  // Filter and search data
  const filteredRequests = useMemo(() => {
    if (!allRequests || !Array.isArray(allRequests)) return [];

    let filtered = allRequests;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter(request => {
        const requestStatus = request.status?.toString().toUpperCase();
        const selectedStatusUpper = selectedStatus.toUpperCase();
        return requestStatus === selectedStatusUpper;
      });
    }

    return filtered;
  }, [allRequests, searchQuery, selectedStatus]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
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
            console.error('No valid ID found for request:', item);
          }
        }}
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Đang tải danh sách yêu cầu..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRefresh} />;
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
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon="warehouse"
          title="Không có yêu cầu nhập kho nào"
          subtitle={
            selectedStatus === "all"
              ? "Bạn chưa có yêu cầu nhập kho nào. Hãy tạo yêu cầu đầu tiên!"
              : `Không có yêu cầu nào với trạng thái "${statusItems.find(item => item.value === selectedStatus)?.label || "không xác định"}"`
          }
          actionText="Tạo yêu cầu"
          onAction={() => router.push('/warehouse/create')}
        />
      ) : (
        <FlatList
          data={filteredRequests}
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
      <Fab
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
