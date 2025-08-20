import api from './axiosClient';

// ========== TYPES ==========

export interface Shipment {
  shipmentId: string;
  shipmentCode: string;
  orderId: string;
  orderCode: string;
  deliveryStaffId: string;
  deliveryStaffName: string;
  shippedQuantity: number;
  shippedAt: string;
  deliveryStatus: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
  shipmentDetails: ShipmentDetail[];
}

export interface ShipmentDetail {
  shipmentDetailId: string;
  orderItemId: string;
  productName: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface UpdateShipmentStatusPayload {
  deliveryStatus: string;
  note?: string;
}

export interface ConfirmDeliveryPayload {
  receivedAt: string;
  note?: string;
  evidencePhotos?: string[]; // URLs của ảnh bằng chứng
}

export interface DeliveryStatistics {
  totalShipments: number;
  completedShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  failedShipments: number;
  todayDeliveries: number;
  weeklyDeliveries: number;
  monthlyDeliveries: number;
}

// ==================== API FUNCTIONS ====================

// Lấy danh sách shipment được phân công cho Delivery Staff hiện tại
export async function getMyShipments(): Promise<Shipment[]> {
  try {
    console.log('🚚 Calling API: /Shipments');
    console.log('🔗 Full URL:', 'http://10.0.2.2:5077/api/Shipments');
    
    const res = await api.get("/Shipments");
    
    console.log('📦 API Response:', res.data);
    console.log('📦 Response status:', res.status);
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching shipments:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error URL:', error.config?.url);
    
    // Nếu có lỗi, trả về mảng rỗng thay vì mock data
    console.log('⚠️ No shipments found or API error');
    return [];
  }
}

// Lấy chi tiết shipment theo ID
export async function getShipmentById(shipmentId: string): Promise<Shipment> {
  try {
    console.log('🚚 Calling API: /Shipments/' + shipmentId);
    const res = await api.get(`/Shipments/${shipmentId}`);
    
    console.log('📦 Shipment detail response:', res.data);
    
    if (res.data && res.data.data) {
      return res.data.data;
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error fetching shipment details:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
}

// Cập nhật trạng thái giao hàng
export async function updateShipmentStatus(
  shipmentId: string, 
  payload: UpdateShipmentStatusPayload
): Promise<boolean> {
  try {
    console.log('🚚 Updating shipment status:', shipmentId, payload);
    
    // Sử dụng PATCH endpoint đơn giản
    const patchPayload = {
      deliveryStatus: payload.deliveryStatus, // Sử dụng enum trực tiếp từ backend
      receivedAt: payload.deliveryStatus === 'Delivered' ? new Date().toISOString() : undefined,
      note: payload.note
    };
    
    console.log('📦 PATCH payload:', patchPayload);
    console.log('📦 PATCH URL:', `/Shipments/update-status/${shipmentId}`);
    
    const res = await api.patch(`/Shipments/update-status/${shipmentId}`, patchPayload);
    
    console.log('✅ Update response:', res.data);
    return res.status === 200;
  } catch (error: any) {
    console.error('❌ Error updating shipment status:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error URL:', error.config?.url);
    
    throw error;
  }
}

// Xác nhận giao hàng thành công
export async function confirmDelivery(
  shipmentId: string, 
  payload: ConfirmDeliveryPayload
): Promise<boolean> {
  try {
    console.log('🚚 Confirming delivery:', shipmentId, payload);
    
    // Sử dụng PATCH endpoint đơn giản
    const patchPayload = {
      deliveryStatus: 'Delivered', // Sử dụng enum trực tiếp
      receivedAt: payload.receivedAt || new Date().toISOString(),
      note: payload.note
    };
    
    console.log('📦 Confirm delivery payload:', patchPayload);
    console.log('📦 PATCH URL:', `/Shipments/update-status/${shipmentId}`);
    
    const res = await api.patch(`/Shipments/update-status/${shipmentId}`, patchPayload);
    
    console.log('✅ Confirm delivery response:', res.data);
    return res.status === 200;
  } catch (error: any) {
    console.error('❌ Error confirming delivery:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error URL:', error.config?.url);
    
    throw error;
  }
}

// Upload ảnh bằng chứng giao hàng
export async function uploadDeliveryEvidence(
  shipmentId: string, 
  imageUri: string
): Promise<string> {
  try {
    console.log('📸 Uploading delivery evidence:', shipmentId);
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'delivery-evidence.jpg',
    } as any);
    
    const res = await api.post(`/Shipments/${shipmentId}/upload-evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data.url || res.data;
  } catch (error) {
    console.error('❌ Error uploading evidence:', error);
    throw error;
  }
}

// Lấy thống kê giao hàng
export async function getDeliveryStatistics(): Promise<DeliveryStatistics> {
  try {
    console.log('📊 Calculating statistics from shipments...');
    const shipments = await getMyShipments();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalShipments = shipments.length;
    const completedShipments = shipments.filter(s => s.deliveryStatus === 'Delivered').length;
    const pendingShipments = shipments.filter(s => s.deliveryStatus === 'Pending').length;
    const inTransitShipments = shipments.filter(s => s.deliveryStatus === 'InTransit').length;
    const failedShipments = shipments.filter(s => s.deliveryStatus === 'Failed').length;
    
    const todayDeliveries = shipments.filter(s => {
      const shippedDate = new Date(s.shippedAt);
      return shippedDate >= today;
    }).length;
    
    const weeklyDeliveries = shipments.filter(s => {
      const shippedDate = new Date(s.shippedAt);
      return shippedDate >= weekAgo;
    }).length;
    
    const monthlyDeliveries = shipments.filter(s => {
      const shippedDate = new Date(s.shippedAt);
      return shippedDate >= monthAgo;
    }).length;
    
    return {
      totalShipments,
      completedShipments,
      pendingShipments,
      inTransitShipments,
      failedShipments,
      todayDeliveries,
      weeklyDeliveries,
      monthlyDeliveries
    };
  } catch (error) {
    console.error('❌ Error calculating statistics:', error);
    return {
      totalShipments: 0,
      completedShipments: 0,
      pendingShipments: 0,
      inTransitShipments: 0,
      failedShipments: 0,
      todayDeliveries: 0,
      weeklyDeliveries: 0,
      monthlyDeliveries: 0
    };
  }
}

// Lấy lịch sử giao hàng
export async function getDeliveryHistory(
  page: number = 1, 
  pageSize: number = 10
): Promise<{ shipments: Shipment[], total: number }> {
  try {
    console.log('📋 Calling API: /Shipments/history');
    const res = await api.get(`/Shipments/history?page=${page}&pageSize=${pageSize}`);
    
    if (res.data && res.data.data) {
      return res.data.data;
    }
    
    return { shipments: res.data, total: res.data.length };
  } catch (error) {
    console.error('❌ Error fetching delivery history:', error);
    throw error;
  }
}
