import api from './axiosClient';

// ========== TYPES ==========
export interface CropStage {
  stageId: string;
  stageCode: string;
  stageName: string;
  stageNameVi: string;
  description: string;
  orderIndex: number;
  estimatedDuration: number; // số ngày
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CropStageListItem {
  stageId: string;
  stageCode: string;
  stageName: string;
  stageNameVi: string;
  orderIndex: number;
  estimatedDuration: number;
}

export interface ServiceResult<T = any> {
  code: number | string;
  message: string;
  data: T | null;
}

// ========== API FUNCTIONS ==========

// Lấy tất cả các giai đoạn
export async function getAllCropStages(): Promise<ServiceResult<CropStageListItem[]>> {
  try {
    const res = await api.get('/CropStages');
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải danh sách giai đoạn", data: null };
  }
}

// Lấy giai đoạn theo ID
export async function getCropStageById(stageId: string): Promise<ServiceResult<CropStage>> {
  try {
    const res = await api.get(`/CropStages/${stageId}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải thông tin giai đoạn", data: null };
  }
}

// Lấy giai đoạn theo mã
export async function getCropStageByCode(stageCode: string): Promise<ServiceResult<CropStage>> {
  try {
    const res = await api.get(`/CropStages/code/${stageCode}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải thông tin giai đoạn", data: null };
  }
}
