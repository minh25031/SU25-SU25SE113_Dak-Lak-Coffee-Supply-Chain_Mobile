import api from './axiosClient';

// =====================
// TYPE DEFINITIONS
// =====================

export interface CropProgress {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageName: string;
  stageCode: string;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  stepIndex?: number;
  actualYield?: number;
}

export interface CropProgressCreateRequest {
  cropSeasonDetailId: string;
  stageId: number;
  progressDate: string;
  actualYield?: number;
  notes?: string;
  mediaFiles?: File[];
}

export interface CropProgressUpdateRequest {
  // Backend expects PascalCase field names to match CropProgressUpdateDto
  ProgressId: string;
  CropSeasonDetailId: string;
  StageId: number;
  StageDescription: string;  // Required field
  ProgressDate?: string;     // Will be formatted as YYYY-MM-DD for DateOnly
  PhotoUrl?: string;
  VideoUrl?: string;
  Note?: string;
  StepIndex?: number;
  ActualYield?: number;
}

export interface CropProgressViewAllDto {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stepIndex?: number;
  stageName: string;
  stageCode: string;
  stageDescription: string;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  actualYield?: number;
  updatedBy?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
  cropSeasonName?: string;
  cropSeasonDetailName?: string;
}

export interface CropProgressViewDetailsDto {
  progressId: string;
  cropSeasonDetailId: string;
  updatedBy?: string;
  stageId: number;
  stageName: string;
  stageCode: string;
  stageDescription: string;
  actualYield?: number;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  updatedByName: string;
  stepIndex?: number;
  createdAt: string;
  updatedAt: string;
  cropSeasonName?: string;
  cropSeasonDetailName?: string;
  farmerName?: string;
  cropName?: string;
  location?: string;
  status?: string;
  stageOrderIndex?: number;
  isFinalStage?: boolean;
}

// =====================
// API FUNCTIONS
// =====================

/**
 * Lấy tất cả crop progress
 */
export async function getAllCropProgresses(): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get<CropProgressViewAllDto[]>('/CropProgresses');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching all crop progresses:', error);
    throw error;
  }
}

/**
 * Lấy tất cả crop progress của user hiện tại
 */
export async function getAllCropProgressesForCurrentUser(): Promise<CropProgressViewAllDto[]> {
  try {
    // Backend không có endpoint /CropProgresses/user, sử dụng /CropProgresses
    const response = await api.get<CropProgressViewAllDto[]>('/CropProgresses');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching user crop progresses:', error);
    throw error;
  }
}

/**
 * Lấy crop progress theo detail ID
 */
export async function getCropProgressesByDetailId(detailId: string): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get<{
      cropSeasonDetailId: string;
      progresses: CropProgressViewAllDto[];
    }>(`/CropProgresses/by-detail/${detailId}`);
    
    // Xử lý response format từ backend
    if (response.data && response.data.progresses && Array.isArray(response.data.progresses)) {
      return response.data.progresses;
    }
    
    // Fallback: nếu response trực tiếp là array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching crop progresses by detail ID:', error);
    throw error;
  }
}

/**
 * Lấy crop progress theo ID
 * Note: Backend không có endpoint GET /CropProgresses/{id}, 
 * nên sử dụng endpoint có sẵn và tìm theo ID
 */
export async function getCropProgressById(id: string): Promise<CropProgressViewDetailsDto | null> {
  try {
    // Vì backend không có endpoint GET theo ID, 
    // chúng ta cần tìm progress này từ danh sách tất cả progress
    const allProgresses = await getAllCropProgressesForCurrentUser();
    
    // Tìm progress theo ID
    const progress = allProgresses.find(p => p.progressId === id);
    
    if (progress) {
      // Convert từ CropProgressViewAllDto sang CropProgressViewDetailsDto
      // Các field cơ bản giống nhau, chỉ khác một số field optional
      return {
        ...progress,
        // Thêm các field mà CropProgressViewDetailsDto có nhưng CropProgressViewAllDto không có
        farmerName: progress.cropSeasonName || 'N/A',
        cropName: progress.cropSeasonDetailName || 'N/A',
        location: 'N/A',
        status: 'Active',
        stageOrderIndex: progress.stepIndex || 0,
        isFinalStage: false,
      } as CropProgressViewDetailsDto;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching crop progress by ID:', error);
    throw error;
  }
}

/**
 * Tạo crop progress mới
 */
export async function createCropProgress(payload: CropProgressCreateRequest): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Luôn sử dụng FormData như web app để tránh lỗi 415
    const formData = new FormData();
    formData.append('cropSeasonDetailId', payload.cropSeasonDetailId);
    formData.append('stageId', payload.stageId.toString());
    formData.append('progressDate', payload.progressDate);
    
    if (payload.actualYield !== undefined) {
      formData.append('actualYield', payload.actualYield.toString());
    }
    
    if (payload.notes) {
      formData.append('notes', payload.notes);
    }
    
    // Thêm media files nếu có
    if (payload.mediaFiles && payload.mediaFiles.length > 0) {
      payload.mediaFiles.forEach((file) => {
        formData.append('mediaFiles', file);
      });
    }

    console.log('📤 Creating crop progress with FormData:', {
      cropSeasonDetailId: payload.cropSeasonDetailId,
      stageId: payload.stageId,
      progressDate: payload.progressDate,
      actualYield: payload.actualYield,
      notes: payload.notes,
      hasMediaFiles: payload.mediaFiles && payload.mediaFiles.length > 0
    });

    const response = await api.post('/CropProgresses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Create response:', response.data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error creating crop progress:', error);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Tạo tiến độ thất bại'
    };
  }
}

/**
 * Cập nhật crop progress
 */
export async function updateCropProgress(id: string, payload: CropProgressUpdateRequest): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Format payload để khớp với backend's CropProgressUpdateDto
    const formattedPayload = {
      ProgressId: id,  // Sử dụng id từ parameter
      CropSeasonDetailId: payload.CropSeasonDetailId,
      StageId: payload.StageId,
      StageDescription: payload.StageDescription,
      ProgressDate: payload.ProgressDate ? payload.ProgressDate.split('T')[0] : undefined, // Format as YYYY-MM-DD for DateOnly
      PhotoUrl: payload.PhotoUrl,
      VideoUrl: payload.VideoUrl,
      Note: payload.Note,
      StepIndex: payload.StepIndex,
      ActualYield: payload.ActualYield,
    };

    console.log('📤 Update payload:', formattedPayload);
    
    const response = await api.put(`/CropProgresses/${id}`, formattedPayload);
    
    console.log('✅ Update response:', response.data);
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error updating crop progress:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cập nhật tiến độ thất bại'
    };
  }
}

/**
 * Xóa crop progress
 */
export async function deleteCropProgress(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.delete(`/CropProgresses/${id}`);
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error deleting crop progress:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Xóa tiến độ thất bại'
    };
  }
}

/**
 * Xóa cứng crop progress (chỉ admin)
 */
export async function hardDeleteCropProgress(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await api.delete(`/CropProgresses/${id}/hard`);
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Error hard deleting crop progress:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Xóa cứng tiến độ thất bại'
    };
  }
}

/**
 * Lấy crop progress theo stage
 */
export async function getCropProgressesByStage(stageId: number): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get<CropProgressViewAllDto[]>(`/CropProgresses/stage/${stageId}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching crop progresses by stage:', error);
    throw error;
  }
}

/**
 * Lấy crop progress theo ngày
 */
export async function getCropProgressesByDate(date: string): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get<CropProgressViewAllDto[]>(`/CropProgresses/date/${date}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching crop progresses by date:', error);
    throw error;
  }
}

/**
 * Tìm kiếm crop progress
 */
export async function searchCropProgresses(query: string): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get<CropProgressViewAllDto[]>(`/CropProgresses/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error searching crop progresses:', error);
    throw error;
  }
}
