import api from './axiosClient';

// ========== TYPES ==========
export interface CropProgress {
  progressId: string;
  cropSeasonDetailId: string;
  stageCode: string;
  stageName: string;
  progressDate: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropProgressCreatePayload {
  cropSeasonDetailId: string;
  stageCode: string;
  progressDate: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  notes?: string;
}

export interface CropProgressUpdatePayload {
  progressId: string;
  stageCode?: string;
  progressDate?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  notes?: string;
  status?: string;
}

export interface CropProgressListItem {
  progressId: string;
  stageCode: string;
  stageName: string;
  progressDate: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  status: string;
  createdAt: string;
}

export interface ServiceResult<T = any> {
  code: number | string;
  message: string;
  data: T | null;
}

// ========== API FUNCTIONS ==========

// Lấy danh sách tiến độ mùa vụ
export async function getCropProgressBySeasonDetail(
  cropSeasonDetailId: string
): Promise<ServiceResult<CropProgressListItem[]>> {
  try {
    const res = await api.get(`/CropProgress/season-detail/${cropSeasonDetailId}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải tiến độ mùa vụ", data: null };
  }
}

// Lấy chi tiết tiến độ
export async function getCropProgressById(
  progressId: string
): Promise<ServiceResult<CropProgress>> {
  try {
    const res = await api.get(`/CropProgress/${progressId}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải chi tiết tiến độ", data: null };
  }
}

// Tạo tiến độ mới
export async function createCropProgress(
  payload: CropProgressCreatePayload
): Promise<ServiceResult<CropProgress>> {
  try {
    const res = await api.post('/CropProgress', payload);
    return { code: 200, message: "Tạo tiến độ thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tạo tiến độ", data: null };
  }
}

// Cập nhật tiến độ
export async function updateCropProgress(
  payload: CropProgressUpdatePayload
): Promise<ServiceResult<CropProgress>> {
  try {
    const res = await api.put(`/CropProgress/${payload.progressId}`, payload);
    return { code: 200, message: "Cập nhật tiến độ thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể cập nhật tiến độ", data: null };
  }
}

// Xóa tiến độ
export async function deleteCropProgress(
  progressId: string
): Promise<ServiceResult<boolean>> {
  try {
    const res = await api.delete(`/CropProgress/${progressId}`);
    return { code: 200, message: "Xóa tiến độ thành công", data: true };
  } catch (err) {
    return { code: 400, message: "Không thể xóa tiến độ", data: null };
  }
}

// Upload media cho tiến độ
export async function uploadProgressMedia(
  progressId: string,
  file: FormData
): Promise<ServiceResult<{ imageUrl?: string; videoUrl?: string }>> {
  try {
    const res = await api.post(`/CropProgress/${progressId}/upload-media`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { code: 200, message: "Upload media thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể upload media", data: null };
  }
}
