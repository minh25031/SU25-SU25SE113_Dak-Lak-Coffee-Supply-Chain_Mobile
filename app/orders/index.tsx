import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAllOrders, Order, OrderItem } from '@/core/api/orders.api';

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load orders từ API
    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);

            const ordersData = await getAllOrders();

            setOrders(ordersData);
        } catch (error) {
            console.error('❌ Error loading orders:', error);
            // Giữ lại dữ liệu cũ nếu có lỗi
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh data
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }, [loadOrders]);

    // Load data khi focus vào screen
    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [loadOrders])
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'chờ xác nhận':
                return '#F59E0B';
            case 'confirmed':
            case 'đã xác nhận':
                return '#3B82F6';
            case 'preparing':
            case 'đang chuẩn bị':
                return '#8B5CF6';
            case 'ready':
            case 'sẵn sàng giao':
                return '#10B981';
            case 'delivering':
            case 'đang giao':
                return '#F59E0B';
            case 'completed':
            case 'hoàn thành':
                return '#10B981';
            case 'cancelled':
            case 'đã hủy':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'chờ xác nhận':
                return 'Chờ xác nhận';
            case 'confirmed':
            case 'đã xác nhận':
                return 'Đã xác nhận';
            case 'preparing':
            case 'đang chuẩn bị':
                return 'Đang chuẩn bị';
            case 'ready':
            case 'sẵn sàng giao':
                return 'Sẵn sàng giao';
            case 'delivering':
            case 'đang giao':
                return 'Đang giao';
            case 'completed':
            case 'hoàn thành':
                return 'Hoàn thành';
            case 'cancelled':
            case 'đã hủy':
                return 'Đã hủy';
            default:
                return status || 'Không xác định';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    const filteredOrders = orders.filter(order =>
        selectedStatus === 'all' || order.status?.toLowerCase() === selectedStatus
    );

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/orders/${item.orderId}` as any)}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{item.orderCode}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.itemsTitle}>Sản phẩm:</Text>
                {item.orderItems && item.orderItems.length > 0 ? (
                    item.orderItems.map((orderItem) => (
                        <View key={orderItem.orderItemId} style={styles.itemRow}>
                            <Text style={styles.itemName}>• {orderItem.productName}</Text>
                            <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
                            <Text style={styles.itemTotal}>{formatCurrency(orderItem.totalPrice)}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noItems}>Không có sản phẩm</Text>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount || 0)}</Text>
                </View>
                <Text style={styles.deliveryTime}>{formatDate(item.actualDeliveryDate)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
                <Text style={styles.headerSubtitle}>Theo dõi trạng thái đơn hàng</Text>
            </View>

            {/* Status Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'all', label: 'Tất cả', count: orders.length },
                        { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status?.toLowerCase() === 'pending').length },
                        { key: 'ready', label: 'Sẵn sàng giao', count: orders.filter(o => o.status?.toLowerCase() === 'ready').length },
                        { key: 'delivering', label: 'Đang giao', count: orders.filter(o => o.status?.toLowerCase() === 'delivering').length },
                        { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status?.toLowerCase() === 'completed').length },
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                selectedStatus === filter.key && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedStatus(filter.key)}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedStatus === filter.key && styles.filterButtonTextActive
                            ]}>
                                {filter.label}
                            </Text>
                            <View style={[
                                styles.filterCount,
                                selectedStatus === filter.key && styles.filterCountActive
                            ]}>
                                <Text style={[
                                    styles.filterCountText,
                                    selectedStatus === filter.key && styles.filterCountTextActive
                                ]}>
                                    {filter.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.orderId}
                contentContainerStyle={styles.ordersList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                        <Text style={styles.emptySubtext}>Hãy tạo đơn hàng mới hoặc kiểm tra lại bộ lọc</Text>
                    </View>
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/orders/new' as any)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4',
    },
    header: {
        backgroundColor: '#8B5CF6',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    filterContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterButtonActive: {
        backgroundColor: '#8B5CF6',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    filterCount: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    filterCountActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    filterCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterCountTextActive: {
        color: '#FFFFFF',
    },
    ordersList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    customerInfo: {
        marginBottom: 16,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    orderDetails: {
        marginBottom: 16,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#6B7280',
        marginHorizontal: 8,
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginRight: 8,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FD7622',
    },
    deliveryTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEFAF4',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    noItems: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingVertical: 10,
    },
});
