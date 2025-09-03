import api from './axiosClient';

// ========== TYPES ==========

export interface CropSeason {
  cropSeasonId: string;  // Đây là ID chính từ API
  name?: string;         // Optional vì API không trả về
  cropSeasonCode?: string; // Thêm trường này để fix lỗi undefined
  seasonName: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CropSeasonStatusValue;
  note?: string;
  commitmentName?: string;
  area?: number;
  details?: CropSeasonDetail[];
  farmerName?: string;
  registrationCode?: string;
  commitmentId?: string;
  createdAt?: string;    // Thêm trường này để fix lỗi formatTimeAgo
  updatedAt?: string;    // Thêm trường này để fix lỗi formatTimeAgo
}

export interface CropSeasonListItem {
  cropSeasonId: string;  // Đây là ID chính từ API
  name?: string;         // Optional vì API không trả về
  cropSeasonCode?: string; // Thêm trường này để fix lỗi undefined
  seasonName: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CropSeasonStatusValue;
  area?: number;
  farmerId: string;
  farmerName: string;
  createdAt?: string;    // Thêm trường này để fix lỗi formatTimeAgo
  updatedAt?: string;    // Thêm trường này để fix lỗi formatTimeAgo
}

export interface CropSeasonDetail {
  committedQuantity: any;
  detailId: string;
  coffeeTypeId: string;
  typeName: string;
  areaAllocated: number;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield: number | null;
  plannedQuality: string;
  qualityGrade: string;
  status: string;
  farmerId: string;
  farmerName: string;
}

export interface CropSeasonCreatePayload {
  commitmentId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface CropSeasonUpdatePayload {
  CropSeasonId: string;  // Backend expects this exact field name
  SeasonName: string;    // Backend expects this exact field name
  StartDate: string;     // Will be converted to DateOnly format
  EndDate: string;       // Will be converted to DateOnly format
  Note?: string | null;  // Backend expects this exact field name
}

export enum CropSeasonStatusValue {
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export const CropSeasonStatusLabels: Record<CropSeasonStatusValue, string> = {
  [CropSeasonStatusValue.Active]: 'Đang hoạt động',
  [CropSeasonStatusValue.Paused]: 'Tạm dừng',
  [CropSeasonStatusValue.Completed]: 'Hoàn thành',
  [CropSeasonStatusValue.Cancelled]: 'Đã hủy'
};

// ========== API FUNCTIONS ==========

/**
 * Lấy tất cả mùa vụ (dành cho Admin hoặc Manager)
 */
export async function getAllCropSeasons(): Promise<CropSeasonListItem[]> {
  try {
    const response = await api.get<CropSeasonListItem[]>('/CropSeasons');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching all crop seasons:', error);
    throw error;
  }
}

/**
 * Lấy mùa vụ của user hiện tại (Farmer)
 */
export async function getCropSeasonsForCurrentUser(): Promise<CropSeasonListItem[]> {
  try {
    console.log('🔍 Fetching crop seasons for current user...');
    const response = await api.get<{
      data: CropSeasonListItem[];
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    }>('/CropSeasons');
    console.log('✅ Crop seasons response:', response.data);
    
    // Xử lý response với pagination format
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('✅ Data extracted from pagination response:', response.data.data.length, 'items');
      return response.data.data;
    }
    
    // Fallback: nếu response trực tiếp là array
    if (response.data && Array.isArray(response.data)) {
      console.log('✅ Response is direct array:', response.data.length, 'items');
      return response.data;
    }
    
    console.log('⚠️ Unknown response format, returning empty array');
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching user crop seasons:', error);
    
    // Log chi tiết lỗi để debug
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response headers:', error.response.headers);
    }
    if (error.request) {
      console.error('❌ Request error:', error.request);
    }
    if (error.message) {
      console.error('❌ Error message:', error.message);
    }
    
    throw error;
  }
}

/**
 * Lấy mùa vụ theo ID
 */
export async function getCropSeasonById(cropSeasonId: string): Promise<CropSeason | null> {
  try {
    const response = await api.get<CropSeason>(`/CropSeasons/${cropSeasonId}`);
    return response.data || null;
  } catch (error) {
    console.error('❌ Error fetching crop season by ID:', error);
    throw error;
  }
}

/**
 * Tạo mùa vụ mới
 */
export async function createCropSeason(payload: CropSeasonCreatePayload): Promise<{
  code: number;
  message: string;
  data?: any;
}> {
  try {
    const response = await api.post('/CropSeasons', payload);
    return {
      code: 1,
      message: 'Tạo mùa vụ thành công',
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error creating crop season:', error);
    return {
      code: 0,
      message: error.response?.data?.message || error.message || 'Tạo mùa vụ thất bại'
    };
  }
}

/**
 * Cập nhật mùa vụ
 */
export async function updateCropSeason(cropSeasonId: string, payload: CropSeasonUpdatePayload): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('🔍 Updating crop season with payload:', payload);
    const response = await api.put(`/CropSeasons/${cropSeasonId}`, payload);
    console.log('✅ Update response:', response.data);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating crop season:', error);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cập nhật mùa vụ thất bại'
    };
  }
}

/**
 * Xóa mùa vụ theo ID
 */
export async function deleteCropSeasonById(cropSeasonId: string): Promise<{
  code: number;
  message: string;
}> {
  try {
    const response = await api.delete(`/CropSeasons/${cropSeasonId}`);
    return {
      code: 200,
      message: 'Xóa mùa vụ thành công'
    };
  } catch (error: any) {
    console.error('❌ Error deleting crop season:', error);
    return {
      code: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Xóa mùa vụ thất bại'
    };
  }
}

/**
 * Tìm kiếm mùa vụ
 */
export async function searchCropSeasons(query: string): Promise<CropSeasonListItem[]> {
  try {
    const response = await api.get<CropSeasonListItem[]>(`/CropSeasons/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error searching crop seasons:', error);
    throw error;
  }
}

/**
 * Lấy mùa vụ theo trạng thái
 */
export async function getCropSeasonsByStatus(status: CropSeasonStatusValue): Promise<CropSeasonListItem[]> {
  try {
    const response = await api.get<CropSeasonListItem[]>(`/CropSeasons/status/${status}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching crop seasons by status:', error);
    throw error;
  }
}
