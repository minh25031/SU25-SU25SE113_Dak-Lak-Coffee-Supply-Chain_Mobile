import api from './axiosClient';

// ========== TYPES ==========

export interface CropSeasonDetail {
  stages: unknown;
  success: unknown;
  error: string;
  detailId: string;
  cropSeasonId: string;
  commitmentDetailId: string; // Dùng thay cho coffeeTypeId
  commitmentDetailCode: string;
  typeName: string; // Thêm typeName
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield?: number | null;
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
  status: number;
  farmerId: string;
  farmerName: string;
  committedQuantity?: number; // Thêm committedQuantity từ commitmentDetail
}

// Tạo vùng trồng – sử dụng commitmentDetailId thay cho coffeeTypeId
export interface CropSeasonDetailCreatePayload {
  cropSeasonId: string;
  commitmentDetailId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
}

export interface CropSeasonDetailUpdatePayload {
  detailId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
  actualYield?: number;
}

// ========== API FUNCTIONS ==========

/**
 * Tạo vùng trồng mới
 */
export async function createCropSeasonDetail(payload: CropSeasonDetailCreatePayload): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const response = await api.post('/CropSeasonDetails', payload);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error creating crop season detail:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Tạo vùng trồng thất bại'
    };
  }
}

/**
 * Cập nhật vùng trồng
 */
export async function updateCropSeasonDetail(id: string, payload: CropSeasonDetailUpdatePayload): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.put(`/CropSeasonDetails/${id}`, payload);
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error updating crop season detail:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cập nhật vùng trồng thất bại'
    };
  }
}

/**
 * Xóa mềm vùng trồng
 */
export async function softDeleteCropSeasonDetail(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.patch(`/CropSeasonDetails/soft-delete/${id}`);
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error soft deleting crop season detail:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Xóa vùng trồng thất bại'
    };
  }
}

/**
 * Lấy vùng trồng theo ID
 */
export async function getCropSeasonDetailById(id: string): Promise<CropSeasonDetail | null> {
  try {
    const response = await api.get<CropSeasonDetail>(`/CropSeasonDetails/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('❌ Error fetching crop season detail by ID:', error);
    throw error;
  }
}

/**
 * Lấy tất cả vùng trồng của một mùa vụ
 */
export async function getCropSeasonDetailsBySeasonId(seasonId: string): Promise<CropSeasonDetail[]> {
  try {
    // Thử endpoint mới trước
    try {
      const response = await api.get<CropSeasonDetail[]>(`/CropSeasonDetails/by-cropSeason/${seasonId}`);
      return response.data || [];
    } catch (error) {
      console.log('⚠️ Endpoint /by-cropSeason không hoạt động, thử endpoint /user');
      
      // Fallback: lấy tất cả details của user và filter theo cropSeasonId
      const response = await api.get<CropSeasonDetail[]>('/CropSeasonDetails/user');
      const allDetails = response.data || [];
      
      // Filter theo cropSeasonId
      const filteredDetails = allDetails.filter(detail => detail.cropSeasonId === seasonId);
      return filteredDetails;
    }
  } catch (error) {
    console.error('❌ Error fetching crop season details by season ID:', error);
    throw error;
  }
}

/**
 * Lấy vùng trồng của user hiện tại
 */
export async function getCropSeasonDetailsForCurrentUser(): Promise<CropSeasonDetail[]> {
  try {
    const response = await api.get<CropSeasonDetail[]>('/CropSeasonDetails/user');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching user crop season details:', error);
    throw error;
  }
}

/**
 * Cập nhật sản lượng thực tế
 */
export async function updateActualYield(id: string, actualYield: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.patch(`/CropSeasonDetails/${id}/yield`, { actualYield });
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error updating actual yield:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cập nhật sản lượng thất bại'
    };
  }
}

/**
 * Cập nhật trạng thái vùng trồng
 */
export async function updateDetailStatus(id: string, status: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.patch(`/CropSeasonDetails/${id}/status`, { status });
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error updating detail status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại'
    };
  }
}
