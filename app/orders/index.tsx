import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    address: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
    totalAmount: number;
    orderDate: string;
    estimatedDelivery: string;
    items: OrderItem[];
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    // Mock data
    useEffect(() => {
        const mockOrders: Order[] = [
            {
                id: '1',
                orderNumber: 'DH001',
                customerName: 'Nguyễn Văn A',
                phone: '0123456789',
                address: '123 Đường ABC, Quận 1, TP.HCM',
                status: 'ready',
                totalAmount: 450000,
                orderDate: '2025-01-15 10:30',
                estimatedDelivery: '2025-01-15 14:00',
                items: [
                    { id: '1', name: 'Cà phê Robusta 500g', quantity: 2, price: 150000, total: 300000 },
                    { id: '2', name: 'Cà phê Arabica 500g', quantity: 1, price: 150000, total: 150000 },
                ],
            },
            {
                id: '2',
                orderNumber: 'DH002',
                customerName: 'Trần Thị B',
                phone: '0987654321',
                address: '456 Đường XYZ, Quận 2, TP.HCM',
                status: 'delivering',
                totalAmount: 250000,
                orderDate: '2025-01-15 11:00',
                estimatedDelivery: '2025-01-15 16:00',
                items: [
                    { id: '3', name: 'Cà phê Chồn 250g', quantity: 1, price: 250000, total: 250000 },
                ],
            },
            {
                id: '3',
                orderNumber: 'DH003',
                customerName: 'Lê Văn C',
                phone: '0555666777',
                address: '789 Đường DEF, Quận 3, TP.HCM',
                status: 'completed',
                totalAmount: 650000,
                orderDate: '2025-01-15 09:00',
                estimatedDelivery: '2025-01-15 10:00',
                items: [
                    { id: '4', name: 'Cà phê Moka 1kg', quantity: 1, price: 400000, total: 400000 },
                    { id: '5', name: 'Cà phê Culi 500g', quantity: 1, price: 250000, total: 250000 },
                ],
            },
            {
                id: '4',
                orderNumber: 'DH004',
                customerName: 'Phạm Thị D',
                phone: '0333444555',
                address: '321 Đường GHI, Quận 4, TP.HCM',
                status: 'pending',
                totalAmount: 300000,
                orderDate: '2025-01-15 12:00',
                estimatedDelivery: '2025-01-15 15:00',
                items: [
                    { id: '6', name: 'Cà phê Robusta 1kg', quantity: 2, price: 150000, total: 300000 },
                ],
            },
        ];
        setOrders(mockOrders);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#F59E0B';
            case 'confirmed':
                return '#3B82F6';
            case 'preparing':
                return '#8B5CF6';
            case 'ready':
                return '#10B981';
            case 'delivering':
                return '#F59E0B';
            case 'completed':
                return '#10B981';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ xác nhận';
            case 'confirmed':
                return 'Đã xác nhận';
            case 'preparing':
                return 'Đang chuẩn bị';
            case 'ready':
                return 'Sẵn sàng giao';
            case 'delivering':
                return 'Đang giao';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const filteredOrders = orders.filter(order =>
        selectedStatus === 'all' || order.status === selectedStatus
    );

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/orders/${item.id}`)}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                    <Text style={styles.orderDate}>📅 {item.orderDate}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>👤 {item.customerName}</Text>
                <Text style={styles.customerPhone}>📱 {item.phone}</Text>
                <Text style={styles.address}>📍 {item.address}</Text>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.itemsTitle}>Sản phẩm:</Text>
                {item.items.map((orderItem) => (
                    <View key={orderItem.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>• {orderItem.name}</Text>
                        <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
                        <Text style={styles.itemTotal}>{formatCurrency(orderItem.total)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
                </View>
                <Text style={styles.deliveryTime}>⏰ {item.estimatedDelivery}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📋 Quản lý đơn hàng</Text>
                <Text style={styles.headerSubtitle}>Theo dõi trạng thái đơn hàng</Text>
            </View>

            {/* Status Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'all', label: 'Tất cả', count: orders.length },
                        { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status === 'pending').length },
                        { key: 'ready', label: 'Sẵn sàng giao', count: orders.filter(o => o.status === 'ready').length },
                        { key: 'delivering', label: 'Đang giao', count: orders.filter(o => o.status === 'delivering').length },
                        { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length },
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
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.ordersList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/orders/new')}
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
});
