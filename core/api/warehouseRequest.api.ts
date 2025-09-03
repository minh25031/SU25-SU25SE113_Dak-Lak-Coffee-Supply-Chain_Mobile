import api from './axiosClient';

// ========== TYPES ==========

export interface WarehouseInboundRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  batchId?: string;
  batchName?: string;
  batchCode?: string;
  coffeeType?: string;
  seasonCode?: string;
  requestedQuantity: number;
  preferredDeliveryDate: string;
  actualDeliveryDate?: string;
  note?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  businessStaffId?: string;
  businessStaffName?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  requestCode?: string;
}

export interface CreateWarehouseInboundRequestPayload {
  batchId?: string;
  requestedQuantity: number;
  preferredDeliveryDate: string;
  note?: string;
}

export interface WarehouseInboundRequestListItem {
  id?: string;
  requestId?: string; // Thêm requestId nếu API trả về field này
  warehouseInboundRequestId?: string; // Thêm warehouseInboundRequestId nếu API trả về field này
  inboundRequestId?: string; // Field chính từ API response
  requestCode?: string; // Thêm requestCode nếu API trả về field này
  batchId?: string;
  batchName?: string;
  batchCode?: string; // Thêm batchCode từ ProcessingBatch
  requestedQuantity: number;
  preferredDeliveryDate: string;
  status: string | number; // Có thể là string hoặc number
  createdAt: string;
  updatedAt?: string; // Thêm trường này để fix lỗi formatTimeAgo
  businessStaffName?: string;
}

export interface ProcessingBatch {
  batchId: string;
  batchCode: string;
  systemBatchCode: string;
  coffeeTypeId: string;
  typeName?: string;
  cropSeasonId: string;
  cropSeasonName: string;
  farmerId: string;
  farmerName: string;
  methodId: number;
  methodName: string;
  stageCount: number;
  totalInputQuantity: number;
  totalOutputQuantity: number;
  status: number; // 0: Chưa bắt đầu, 1: Đang xử lý, 2: Hoàn tất, 3: Đã huỷ
  createdAt: string;
}

interface ServiceResult<T = any> {
  status: string;
  message: string;
  data: T | null;
}

// ==================== API FUNCTIONS ====================

// Lấy danh sách yêu cầu nhập kho của farmer hiện tại
export async function getWarehouseInboundRequestsForCurrentUser(): Promise<WarehouseInboundRequestListItem[]> {
  try {
    console.log('🔍 Calling API: /WarehouseInboundRequests/farmer');
    const res = await api.get("/WarehouseInboundRequests/farmer");
    console.log('📡 Raw API Response:', res);
    console.log('📡 Response status:', res.status);
    console.log('📡 Response data:', res.data);
    console.log('📡 Response data type:', typeof res.data);
    console.log('📡 Response data keys:', Object.keys(res.data || {}));
    
    // Kiểm tra các format có thể có
    let data: WarehouseInboundRequestListItem[] = [];
    
    if (res.data && Array.isArray(res.data)) {
      // Trường hợp API trả về array trực tiếp
      console.log('✅ API returned array directly');
      data = res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      // Trường hợp API trả về {data: [...]}
      console.log('✅ API returned {data: [...]}');
      data = res.data.data;
    } else if (res.data && res.data.status === "SUCCESS_READ" && res.data.data) {
      // Trường hợp API trả về ServiceResult format
      console.log('✅ API returned ServiceResult format');
      data = res.data.data;
    } else if (res.data && res.data.status === 1 && res.data.data) {
      // Trường hợp API trả về {status: 1, data: [...]} như web FE
      console.log('✅ API returned {status: 1, data: [...]} format');
      data = res.data.data;
    } else {
      console.log('❌ Unknown response format:', res.data);
    }
    
    // Lấy thông tin batch để join
    console.log('🔍 Fetching processing batches for batch info...');
    const batches = await getProcessingBatchesForFarmer();
    console.log('📦 Available batches:', batches);
    
    // Join với batch information
    const enrichedData = data.map(request => {
      console.log('📦 Processing request:', request);
      console.log('📦 Request ID field:', request.id);
      console.log('📦 Request requestId field:', request.requestId);
      console.log('📦 Request keys:', Object.keys(request));
      console.log('📦 All request values:', JSON.stringify(request, null, 2));
      
      const batch = batches.find(b => b.batchId === request.batchId);
      return {
        ...request,
        batchCode: batch?.batchCode,
        batchName: batch?.typeName || batch?.batchCode || request.batchName,
      };
    });
    
    console.log('✅ Final enriched data to return:', enrichedData);
    return enrichedData || [];
  } catch (err) {
    console.error("❌ Lỗi getWarehouseInboundRequestsForCurrentUser:", err);
    console.error("❌ Error details:", err?.response?.data);
    return [];
  }
}

// Lấy chi tiết yêu cầu nhập kho
export async function getWarehouseInboundRequestById(id: string): Promise<WarehouseInboundRequest | null> {
  try {
    console.log('🔍 Calling detail API: /WarehouseInboundRequests/farmer/${id}');
    const res = await api.get(`/WarehouseInboundRequests/farmer/${id}`);
    console.log('📡 Detail API Response:', res.data);
    console.log('📡 Detail Response status:', res.status);
    console.log('📡 Detail Response data type:', typeof res.data);
    console.log('📡 Detail Response data keys:', Object.keys(res.data || {}));
    
    let data: WarehouseInboundRequest | null = null;
    
    if (res.data && res.data.status === "SUCCESS_READ" && res.data.data) {
      // ServiceResult format
      console.log('✅ Detail API returned ServiceResult format');
      data = res.data.data;
    } else if (res.data && res.data.status === 1 && res.data.data) {
      // Format như web FE: {status: 1, data: {...}}
      console.log('✅ Detail API returned {status: 1, data: {...}} format');
      data = res.data.data;
    } else if (res.data && !res.data.status) {
      // Direct object format
      console.log('✅ Detail API returned direct object format');
      data = res.data;
    } else {
      console.log('❌ Unknown detail response format:', res.data);
    }
    
    console.log('✅ Final detail data to return:', data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi getWarehouseInboundRequestById:", err);
    console.error("❌ Error details:", err?.response?.data);
    return null;
  }
}

// Tạo yêu cầu nhập kho mới
export async function createWarehouseInboundRequest(data: CreateWarehouseInboundRequestPayload): Promise<ServiceResult> {
  try {
    const res = await api.post<ServiceResult>("/WarehouseInboundRequests", data);
    return res.data;
  } catch (err: any) {
    console.error("Lỗi createWarehouseInboundRequest:", err);
    throw new Error(err?.response?.data?.message || "Tạo yêu cầu nhập kho thất bại.");
  }
}

// Hủy yêu cầu nhập kho
export async function cancelWarehouseInboundRequest(id: string): Promise<{ code: number; message: string }> {
  try {
    const res = await api.put<ServiceResult>(`/WarehouseInboundRequests/${id}/cancel`);
    if (res.data.status === "SUCCESS_UPDATE") {
      return {
        code: 200,
        message: res.data.message || "Hủy yêu cầu thành công",
      };
    } else {
      return {
        code: 400,
        message: res.data.message || "Hủy yêu cầu thất bại",
      };
    }
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Hủy yêu cầu thất bại.";
    return {
      code: 400,
      message,
    };
  }
}

// Lấy danh sách processing batch đã hoàn thành của farmer
export async function getProcessingBatchesForFarmer(): Promise<ProcessingBatch[]> {
  try {
    console.log('🔍 Calling API: /ProcessingBatch');
    const res = await api.get<ProcessingBatch[]>("/ProcessingBatch");
    console.log('📡 ProcessingBatch API Response:', res.data);
    console.log('📡 Response type:', typeof res.data);
    console.log('📡 Is array:', Array.isArray(res.data));
    console.log('📡 Raw data length:', res.data?.length || 0);
    
    // Lọc chỉ lấy các batch có status = 2 (Hoàn tất)
    const completedBatches = (res.data || []).filter(batch => batch.status === 2);
    console.log('📡 Completed batches:', completedBatches);
    console.log('📡 Completed batches count:', completedBatches.length);
    
    // Log chi tiết từng batch
    completedBatches.forEach((batch, index) => {
      console.log(`📡 Completed batch ${index}:`, {
        batchId: batch.batchId,
        batchCode: batch.batchCode,
        totalOutputQuantity: batch.totalOutputQuantity,
        status: batch.status,
        typeName: batch.typeName
      });
    });
    
    return completedBatches;
  } catch (err) {
    console.error("❌ Lỗi getProcessingBatchesForFarmer:", err);
    console.error("❌ Error details:", err?.response?.data);
    return [];
  }
}
