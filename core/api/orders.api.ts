import api from './axiosClient';

// ========== TYPES ==========

export interface Order {
  orderId: string;
  orderCode: string;
  deliveryBatchId: string;
  deliveryRound?: number;
  orderDate?: string;
  actualDeliveryDate?: string;
  totalAmount?: number;
  note?: string;
  status: string;
  cancelReason?: string;
  invoiceNumber?: string;
  paymentProgressJson?: string;
  invoiceFileUrl?: string;
  paidAmount: number;
  lastPaidAt?: string;
  paidPercent?: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  createdAt: string;
}

export interface OrderCreateDto {
  deliveryBatchId: string;
  deliveryRound: number;
  orderDate: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  note?: string;
  orderItems: OrderItemCreateDto[];
}

export interface OrderItemCreateDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface OrderUpdateDto {
  deliveryRound?: number;
  orderDate?: string;
  actualDeliveryDate?: string;
  totalAmount?: number;
  note?: string;
  status?: string;
  cancelReason?: string;
  paymentStatus?: string;
}

// ==================== API FUNCTIONS ====================

// Lấy danh sách tất cả đơn hàng
export async function getAllOrders(): Promise<Order[]> {
  try {
    console.log('📋 Calling API: /Orders');
    const res = await api.get("/Orders");
    
    console.log('📦 Orders API Response:', res.data);
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    return [];
  }
}

// Lấy chi tiết đơn hàng theo ID
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    console.log('📋 Calling API: /Orders/' + orderId);
    const res = await api.get(`/Orders/${orderId}`);
    
    console.log('📦 Order detail response:', res.data);
    
    if (res.data && res.data.data) {
      return res.data.data;
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error fetching order details:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
}

// Tạo đơn hàng mới
export async function createOrder(payload: OrderCreateDto): Promise<Order> {
  try {
    console.log('📋 Creating new order:', payload);
    const res = await api.post("/Orders", payload);
    
    console.log('✅ Order created:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
}

// Cập nhật đơn hàng
export async function updateOrder(orderId: string, payload: OrderUpdateDto): Promise<Order> {
  try {
    console.log('📋 Updating order:', orderId, payload);
    const res = await api.put(`/Orders/${orderId}`, payload);
    
    console.log('✅ Order updated:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error updating order:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
}

// Xóa mềm đơn hàng
export async function softDeleteOrder(orderId: string): Promise<boolean> {
  try {
    console.log('📋 Soft deleting order:', orderId);
    const res = await api.patch(`/Orders/soft-delete/${orderId}`);
    
    console.log('✅ Order soft deleted:', res.data);
    return res.status === 200;
  } catch (error: any) {
    console.error('❌ Error soft deleting order:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
}

// Lấy đơn hàng theo trạng thái
export async function getOrdersByStatus(status: string): Promise<Order[]> {
  try {
    console.log('📋 Calling API: /Orders with status filter:', status);
    const res = await api.get(`/Orders?status=${status}`);
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching orders by status:', error);
    return [];
  }
}

// Lấy đơn hàng theo delivery batch
export async function getOrdersByDeliveryBatch(deliveryBatchId: string): Promise<Order[]> {
  try {
    console.log('📋 Calling API: /Orders by delivery batch:', deliveryBatchId);
    const res = await api.get(`/Orders?deliveryBatchId=${deliveryBatchId}`);
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching orders by delivery batch:', error);
    return [];
  }
}
