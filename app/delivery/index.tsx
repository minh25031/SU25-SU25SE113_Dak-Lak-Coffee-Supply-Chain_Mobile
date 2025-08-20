import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, Searchbar } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Background from '@/components/Background';
import ShipmentCard from '@/components/ShipmentCard';
import { 
  getMyShipments, 
  getDeliveryStatistics, 
  Shipment, 
  DeliveryStatistics 
} from '@/core/api/delivery.api';
import { useDeliveryStore } from '@/stores/deliveryStore';
import { useAuthStore } from '@/stores/authStore';

export default function DeliveryDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userName = user?.name || user?.fullName || 'Nhân viên giao hàng';

  const {
    shipments,
    statistics,
    loading,
    refreshing,
    setShipments,
    setStatistics,
    setLoading,
    setRefreshing,
  } = useDeliveryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚚 Loading delivery data...');

      // Load shipments and statistics in parallel
      const [shipmentsData, statisticsData] = await Promise.all([
        getMyShipments(),
        getDeliveryStatistics(),
      ]);

      setShipments(shipmentsData);
      setStatistics(statisticsData);
    } catch (error) {
      console.error('❌ Error loading delivery data:', error);
    } finally {
      setLoading(false);
    }
  }, [setShipments, setStatistics, setLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData, setRefreshing]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleShipmentPress = (shipment: Shipment) => {
    router.push(`/delivery/${shipment.shipmentId}` as any);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || 
      shipment.deliveryStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'Pending', label: 'Chờ giao' },
    { value: 'InTransit', label: 'Đang giao' },
    { value: 'Delivered', label: 'Đã giao' },
    { value: 'Failed', label: 'Thất bại' },
    { value: 'Returned', label: 'Hoàn trả' },
  ];

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
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Chào buổi sáng, {userName}</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/delivery/history' as any)}
            style={styles.historyButton}
          >
            Lịch sử
          </Button>
        </View>

        {/* Statistics Cards */}
        {statistics && (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="truck-delivery" size={24} color="#3B82F6" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>{statistics.totalShipments}</Text>
                    <Text style={styles.statLabel}>Tổng chuyến giao</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>{statistics.completedShipments}</Text>
                    <Text style={styles.statLabel}>Đã giao</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>{statistics.pendingShipments}</Text>
                    <Text style={styles.statLabel}>Chờ giao</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="truck" size={24} color="#8B5CF6" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>{statistics.inTransitShipments}</Text>
                    <Text style={styles.statLabel}>Đang giao</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Tìm kiếm chuyến giao..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Status Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              mode={selectedStatus === option.value ? "contained" : "outlined"}
              onPress={() => setSelectedStatus(option.value)}
              style={styles.filterButton}
              labelStyle={styles.filterButtonLabel}
            >
              {option.label}
            </Button>
          ))}
        </ScrollView>

        {/* Shipments List */}
        <View style={styles.shipmentsContainer}>
          <Text style={styles.sectionTitle}>
            Chuyến giao của tôi ({filteredShipments.length})
          </Text>

          {filteredShipments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                {searchQuery || selectedStatus 
                  ? 'Không tìm thấy chuyến giao phù hợp'
                  : 'Chưa có chuyến giao nào được phân công'
                }
              </Text>
            </View>
          ) : (
            filteredShipments.map((shipment) => {
              // Null check để tránh crash
              if (!shipment) {
                console.warn('⚠️ Delivery dashboard: shipment is null/undefined');
                return null;
              }
              
              return (
                <ShipmentCard
                  key={shipment.shipmentId}
                  shipment={shipment}
                  onPress={handleShipmentPress}
                />
              );
            }).filter(Boolean) // Remove null items
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  historyButton: {
    backgroundColor: '#FD7622',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 8,
    marginHorizontal: '1%',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#F9FAFB',
    elevation: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    marginRight: 8,
    borderRadius: 20,
  },
  filterButtonLabel: {
    fontSize: 12,
  },
  shipmentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
